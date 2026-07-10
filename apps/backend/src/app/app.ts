import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import path from 'path';
import router from 'src/routes';
import errorHandler from 'src/middlewares/error.middleware';
import logger from 'src/middlewares/logger.middleware';
import { testConnection } from 'src/config/database';
import AiUsageStats from 'src/models/ai-usage.model';
import SystemConfig from 'src/models/system-config.model';
import { loadConfig } from 'src/services/config.service';
import { startDailyResetScheduler } from 'src/ai-assistant/services/rate-limit.service';

const ALLOWED_ORIGINS = ['https://yfeng.site', 'https://www.yfeng.site'];

export const createApp = async (): Promise<Koa> => {
  const app = new Koa();

  app.use(cors({
    origin(ctx) {
      const requestOrigin = ctx.get('Origin');
      if (process.env.NODE_ENV === 'production') {
        return ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : '';
      }
      return requestOrigin || '*';
    },
    credentials: true,
  }));
  app.use(logger);
  app.use(errorHandler);
  app.use(koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(process.cwd(), 'public/uploads/temp'),
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024,
    },
    json: true,
    text: true,
  }));

  app.use(router.routes());
  app.use(router.allowedMethods());

  try {
    await testConnection();
    await AiUsageStats.sync();
    await SystemConfig.sync();
    await loadConfig();
    startDailyResetScheduler();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.log('Application will run without database persistence');
  }

  return app;
}

export default createApp;
