import type { Context } from 'koa';
import geoip from 'geoip-lite';
import { recordVisit, getStats } from '../services/visitor.service';

const CHINESE_REGIONS = ['CN', 'HK', 'MO', 'TW'];

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

      const userAgent = (ctx.req.headers['user-agent'] as string) || '';
      const result = await recordVisit(ip, userAgent);
      ctx.body = { success: true, isNewVisitor: result.isNewVisitor };
    } catch (err: any) {
      console.error('Visitor record error:', err);
      // 访问记录失败不影响主流程，返回成功
      ctx.body = { success: false };
    }
  }

  /**
   * GET /api/visitor/location
   * 根据 IP 判断是否为中国地区（含港澳台）
   */
  async location(ctx: Context) {
    try {
      const ip =
        (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (ctx.req.headers['x-real-ip'] as string) ||
        ctx.ip ||
        '';

      const lookup = geoip.lookup(ip);
      const country = lookup?.country || '';
      const isChineseRegion = !country || CHINESE_REGIONS.includes(country);

      ctx.body = { country, isChineseRegion };
    } catch (err: any) {
      console.error('Location detection error:', err);
      ctx.body = { country: '', isChineseRegion: true };
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
