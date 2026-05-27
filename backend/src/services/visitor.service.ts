import crypto from 'crypto';
import { Op } from 'sequelize';
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

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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
 * 记录一次访问
 * @returns { isNewVisitor: boolean } 是否为新访客（UV 维度）
 */
export async function recordVisit(ip: string): Promise<{ isNewVisitor: boolean }> {
  // 局域网 IP 不记录
  // TODO: 测试完成后恢复
  // if (isPrivateIp(ip)) {
  //   return { isNewVisitor: false };
  // }

  const today = getTodayStr();
  const ipHash = hashIp(ip);

  // 确保今日汇总记录存在
  await VisitorDailySummary.findOrCreate({
    where: { visit_date: today },
    defaults: { visit_date: today, uv_count: 0, pv_count: 0 },
  });

  // 检查今天是否已有该访客
  const existingLog = await VisitorLog.findOne({
    where: { visit_date: today, ip_hash: ipHash },
  });

  if (existingLog) {
    // 老访客：只增加 PV
    await VisitorDailySummary.increment('pv_count', {
      where: { visit_date: today },
    });
    return { isNewVisitor: false };
  }

  // 新访客：查询地理位置并记录
  const location = await getIpLocation(ip);
  console.log(`[Visitor] New visitor: ip=${ip}, hash=${ipHash}, location=${location}`);

  try {
    await VisitorLog.create({
      visit_date: today,
      ip_hash: ipHash,
      location,
    });
    console.log(`[Visitor] Inserted visitor log for ${ip}`);
  } catch (err: any) {
    console.error(`[Visitor] Failed to insert visitor log: ${err.message}`);
    // 插入失败也要增加 PV
  }

  // PV +1, UV +1
  await VisitorDailySummary.increment(['pv_count', 'uv_count'], {
    where: { visit_date: today },
  });

  return { isNewVisitor: true };
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
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

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
    const dateStr = d.toISOString().slice(0, 10);
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
