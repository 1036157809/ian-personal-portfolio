import type { Context } from 'koa';
import { getAllConfig, setConfig, loadConfig } from '../services/config.service';
import { invalidateClient } from '../ai-assistant/services/embedding.service';

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const CACHE_MAX_AGE = 7200; // 2小时

const checkAuth = (ctx: Context): boolean => {
  if (ctx.headers['x-admin-secret'] !== ADMIN_SECRET) {
    ctx.status = 403;
    ctx.body = { error: 'Forbidden' };
    return false;
  }
  return true;
};

export class ConfigController {
  async getAll(ctx: Context) {
    if (!checkAuth(ctx)) return;
    ctx.set('Cache-Control', `private, max-age=${CACHE_MAX_AGE}`);
    ctx.body = { config: getAllConfig() };
  }

  async update(ctx: Context) {
    if (!checkAuth(ctx)) return;
    const { key } = ctx.params;
    const { value } = (ctx.request as any). body as { value?: string };

    if (!value || typeof value !== 'string') {
      ctx.status = 400;
      ctx.body = { error: 'value is required' };
      return;
    }

    await setConfig(key, value);
    if (key.startsWith('embedding_')) invalidateClient();
    ctx.body = { success: true, key, value };
  }

  async refresh(ctx: Context) {
    if (!checkAuth(ctx)) return;
    const config = await loadConfig();
    ctx.body = { success: true, count: Object.keys(config).length };
  }
}

export default new ConfigController();
