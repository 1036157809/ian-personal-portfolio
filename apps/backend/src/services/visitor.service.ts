import crypto from 'crypto';
import { Op, Transaction } from 'sequelize';
import { VisitorLog, VisitorDailySummary } from 'src/models/visitor.model';

const SALT = process.env.VISITOR_SALT || 'portfolio-visitor-salt-2026';

const LOCAL_IP_RANGES = [
  '127.',
  '10.',
  '192.168.',
  '::1',
  'fc',
  'fd',
  'fe80:',
];
for (let i = 16; i <= 31; i++) {
  LOCAL_IP_RANGES.push(`172.${i}.`);
}

// IP 地理位置缓存（避免重复查询）
const ipLocationCache = new Map<string, string>();

/**
 * 查询 IP 地理位置（省份|城市）
 * 使用 ip-api.com 免费接口，返回中文
 */
async function getIpLocation(ip: string): Promise<string> {
  const cached = ipLocationCache.get(ip);
  if (cached) return cached;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN&fields=status,country,regionName,city,query`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json() as any;
    if (data.status === 'success') {
      const province = data.regionName || '';
      const city = data.city || '';
      const location = [province, city].filter(Boolean).join('|');
      ipLocationCache.set(ip, location);
      return location;
    }
    console.warn(`[Visitor] ip-api.com returned status=${data.status} for ip=${ip}, message=${data.message || 'unknown'}`);
  } catch (err: any) {
    console.warn(`[Visitor] getIpLocation failed for ip=${ip}: ${err.message}`);
  }

  return '';
}

function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayStr(): string {
  return getLocalDateStr();
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + SALT).digest('hex');
}

/**
 * 判断是否为局域网/私有 IP
 */
function isPrivateIp(ip: string): boolean {
  return LOCAL_IP_RANGES.some((range) => ip.startsWith(range));
}

/**
 * 解析 User-Agent，返回 设备类型|操作系统|浏览器
 * 例如：Desktop|Windows|Chrome
 */
function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown|Unknown|Unknown';

  // 设备类型
  let device = 'Desktop';
  if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) {
    device = 'Mobile';
  } else if (/iPad|Tablet|Kindle/i.test(ua)) {
    device = 'Tablet';
  }

  // 操作系统
  let os = 'Unknown';
  if (/Windows NT 10/i.test(ua)) os = 'Windows';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows';
  else if (/Windows NT 6.2/i.test(ua)) os = 'Windows';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|macOS/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // 浏览器
  let browser = 'Unknown';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE';

  return `${device}|${os}|${browser}`;
}

/**
 * 记录一次访问
 * @returns { isNewVisitor: boolean } 是否为新访客（UV 维度）
 */
export async function recordVisit(ip: string, userAgent: string = ''): Promise<{ isNewVisitor: boolean }> {
  // 局域网 IP 不记录
  if (isPrivateIp(ip)) {
    return { isNewVisitor: false };
  }

  const sequelize = VisitorLog.sequelize!;
  let transaction: Transaction | undefined;

  try {
    transaction = await sequelize.transaction();

    const today = getTodayStr();
    const ipHash = hashIp(ip);

    // 确保今日汇总记录存在
    await VisitorDailySummary.findOrCreate({
      where: { visit_date: today },
      defaults: { visit_date: today, uv_count: 0, pv_count: 0 },
      transaction,
    });

    // 检查今天是否已有该访客
    const existingLog = await VisitorLog.findOne({
      where: { visit_date: today, ip_hash: ipHash },
      transaction,
    });

    if (existingLog) {
      // 老访客：只增加 PV
      await VisitorDailySummary.increment('pv_count', {
        where: { visit_date: today },
        transaction,
      });
      await transaction.commit();
      return { isNewVisitor: false };
    }

    // 新访客：查询地理位置并记录
    const location = await getIpLocation(ip);
    const device = parseUserAgent(userAgent);
    console.log(`[Visitor] New visitor: ip=${ip}, device=${device}, location=${location}`);

    await VisitorLog.create({
      visit_date: today,
      ip_hash: ipHash,
      ip,
      user_agent: device,
      location,
    } as any, { transaction });
    console.log(`[Visitor] Inserted visitor log for ${ip}`);

    // PV +1, UV +1
    await VisitorDailySummary.increment(['pv_count', 'uv_count'], {
      where: { visit_date: today },
      transaction,
    });

    await transaction.commit();
    return { isNewVisitor: true };
  } catch (err: any) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error(`[Visitor] recordVisit failed: ${err.message}`);
    return { isNewVisitor: false };
  }
}

/**
 * 获取统计数据
 */
export async function getStats(): Promise<{
  today: { uv: number; pv: number };
  total: { uv: number; pv: number };
  recent7days: Array<{ date: string; uv: number; pv: number }>;
}> {
  const today = getTodayStr();

  // 今日数据
  const todayRecord = await VisitorDailySummary.findOne({
    where: { visit_date: today },
  });

  // 总计数据
  const totalResult = await VisitorDailySummary.findOne({
    attributes: [
      [VisitorDailySummary.sequelize!.fn('SUM', VisitorDailySummary.sequelize!.col('uv_count')), 'total_uv'],
      [VisitorDailySummary.sequelize!.fn('SUM', VisitorDailySummary.sequelize!.col('pv_count')), 'total_pv'],
    ],
    raw: true,
  }) as any;

  // 近7天趋势
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = getLocalDateStr(sevenDaysAgo);

  const recentRecords = await VisitorDailySummary.findAll({
    where: { visit_date: { [Op.gte]: sevenDaysAgoStr } },
    order: [['visit_date', 'ASC']],
    raw: true,
  }) as any[];

  // 补全缺失的日期（确保7天都有数据）
  const recent7days: Array<{ date: string; uv: number; pv: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateStr(d);
    const record = recentRecords.find((r: any) => r.visit_date === dateStr);
    recent7days.push({
      date: dateStr,
      uv: record?.uv_count ?? 0,
      pv: record?.pv_count ?? 0,
    });
  }

  return {
    today: {
      uv: todayRecord?.uv_count ?? 0,
      pv: todayRecord?.pv_count ?? 0,
    },
    total: {
      uv: parseInt(totalResult?.total_uv ?? 0),
      pv: parseInt(totalResult?.total_pv ?? 0),
    },
    recent7days,
  };
}
