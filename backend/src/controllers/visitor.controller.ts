import type { Context } from 'koa';
import { recordVisit, getStats } from '../services/visitor.service';

export class VisitorController {
  /**
   * POST /api/visitor/record
   * 记录一次访问
   */
  async record(ctx: Context) {
    try {
      // 获取真实 IP（考虑反向代理）
      const ip =
        (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (ctx.req.headers['x-real-ip'] as string) ||
        ctx.ip ||
        'unknown';

      const result = await recordVisit(ip);
      ctx.body = { success: true, isNewVisitor: result.isNewVisitor };
    } catch (err: any) {
      console.error('Visitor record error:', err);
      // 访问记录失败不影响主流程，返回成功
      ctx.body = { success: false };
    }
  }

  /**
   * GET /api/visitor/stats
   * 获取访问统计数据
   */
  async stats(ctx: Context) {
    try {
      const result = await getStats();
      ctx.body = result;
    } catch (err: any) {
      console.error('Visitor stats error:', err);
      ctx.status = 500;
      ctx.body = { error: 'Failed to get stats' };
    }
  }
}

export default new VisitorController();
