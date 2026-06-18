import cron from 'node-cron';
import AiUsageStats from 'src/models/ai-usage.model';

const DAILY_LIMIT = 100;

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * 每天零点重置计数器
 * 将昨天的记录 call_count 清零（或直接删除，这里选择清零保留历史）
 */
export function startDailyResetScheduler(): void {
  // 每天 00:00:00 执行
  cron.schedule('0 0 * * *', async () => {
    const today = getTodayStr();
    try {
      // 确保今天有一条记录，没有就创建
      await AiUsageStats.findOrCreate({
        where: { call_date: today },
        defaults: { call_date: today, call_count: 0 },
      });
      console.log(`[RateLimit] Daily counter reset for ${today}`);
    } catch (err) {
      console.error('[RateLimit] Failed to reset daily counter:', err);
    }
  }, {
    timezone: 'Asia/Shanghai',
  });
  console.log('[RateLimit] Daily reset scheduler started (00:00 CST)');
}

/**
 * 检查并递增调用次数
 * @returns true = 未超限，false = 已达上限
 */
export async function checkAndIncrement(): Promise<boolean> {
  const today = getTodayStr();

  const [record] = await AiUsageStats.findOrCreate({
    where: { call_date: today },
    defaults: { call_date: today, call_count: 0 },
  });

  if (record.call_count >= DAILY_LIMIT) {
    return false;
  }

  await record.increment('call_count');
  return true;
}

/**
 * 获取今日已调用次数
 */
export async function getTodayCount(): Promise<number> {
  const today = getTodayStr();
  const record = await AiUsageStats.findOne({ where: { call_date: today } });
  return record?.call_count ?? 0;
}
