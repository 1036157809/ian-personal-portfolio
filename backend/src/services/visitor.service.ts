import crypto from 'crypto';
import { Op } from 'sequelize';
import { VisitorLog, VisitorDailySummary } from 'src/models/visitor.model';

const SALT = process.env.VISITOR_SALT || 'portfolio-visitor-salt-2026';

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + SALT).digest('hex');
}

/**
 * 记录一次访问
 * @returns { isNewVisitor: boolean } 是否为新访客（UV 维度）
 */
export async function recordVisit(ip: string): Promise<{ isNewVisitor: boolean }> {
  const today = getTodayStr();
  const ipHash = hashIp(ip);

  // 确保今日汇总记录存在
  await VisitorDailySummary.findOrCreate({
    where: { visit_date: today },
    defaults: { visit_date: today, uv_count: 0, pv_count: 0 },
  });

  // 尝试插入访问日志（利用唯一索引去重）
  const [log, created] = await VisitorLog.findOrCreate({
    where: { visit_date: today, ip_hash: ipHash },
    defaults: { visit_date: today, ip_hash: ipHash },
  });

  // PV 始终 +1
  await VisitorDailySummary.increment('pv_count', {
    where: { visit_date: today },
  });

  // 只有新访客才 UV +1
  if (created) {
    await VisitorDailySummary.increment('uv_count', {
      where: { visit_date: today },
    });
    return { isNewVisitor: true };
  }

  return { isNewVisitor: false };
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
