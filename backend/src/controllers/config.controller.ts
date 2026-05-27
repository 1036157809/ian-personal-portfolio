import type { Context } from 'koa';
import { getAllConfig, setConfig } from '../services/config.service';
import { invalidateClient } from '../ai-assistant/services/embedding.service';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'portfolio-admin-2026';

function checkAuth(ctx: Context): boolean {
  const secret = ctx.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    ctx.status = 403;
    ctx.body = { error: 'Forbidden' };
    return false;
  }
  return true;
}

export class ConfigController {
  /**
   * GET /api/config
   */
  async getAll(ctx: Context) {
    if (!checkAuth(ctx)) return;
    const config = await getAllConfig();
    ctx.body = { config };
  }

  /**
   * PUT /api/config/:key
   */
  async update(ctx: Context) {
    if (!checkAuth(ctx)) return;
    const { key } = ctx.params;
    const { value } = (ctx.request as any).body as { value?: string };

    if (!value || typeof value !== 'string') {
      ctx.status = 400;
      ctx.body = { error: 'value is required' };
      return;
    }

    await setConfig(key, value);
    if (key.startsWith('embedding_')) {
      invalidateClient();
    }
    ctx.body = { success: true, key, value };
  }
}

export default new ConfigController();
