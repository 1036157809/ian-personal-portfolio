import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import path from 'path';
import router from 'src/routes';
import errorHandler from 'src/middlewares/error.middleware';
import logger from 'src/middlewares/logger.middleware';
import { sequelize, testConnection } from 'src/config/database';
import AiUsageStats from 'src/models/ai-usage.model';
import { VisitorLog, VisitorDailySummary } from 'src/models/visitor.model';
import SystemConfig from 'src/models/system-config.model';
import { startDailyResetScheduler } from 'src/ai-assistant/services/rate-limit.service';
import { initDefaultConfig } from 'src/services/config.service';

const ALLOWED_ORIGINS = ['https://yfeng.site', 'https://www.yfeng.site'];

export async function createApp(): Promise<Koa> {
  const app = new Koa();

  // Middlewares
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
      maxFileSize: 100 * 1024 * 1024, // 100MB
    },
    json: true,
    text: true,
  }));

  // Routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  // Initialize database
  try {
    await testConnection();
    await AiUsageStats.sync();
    await VisitorLog.sync();
    await VisitorDailySummary.sync();

    // Migrate: drop & recreate visitor tables to change id from INT to VARCHAR(36) (UUID)
    // Visitor logs are transient data, so dropping is acceptable
    try {
      const [logCols] = await sequelize.query("SHOW COLUMNS FROM visitor_log WHERE Field = 'id'");
      if (Array.isArray(logCols) && logCols.length > 0 && (logCols[0] as any).Type.includes('int')) {
        await sequelize.query('DROP TABLE IF EXISTS `visitor_log`');
        console.log('[Migrate] visitor_log dropped for UUID migration');
      }
      const [summaryCols] = await sequelize.query("SHOW COLUMNS FROM visitor_daily_summary WHERE Field = 'id'");
      if (Array.isArray(summaryCols) && summaryCols.length > 0 && (summaryCols[0] as any).Type.includes('int')) {
        await sequelize.query('DROP TABLE IF EXISTS `visitor_daily_summary`');
        console.log('[Migrate] visitor_daily_summary dropped for UUID migration');
      }
    } catch (migrateErr: any) {
      console.error('[Migrate] Failed to drop visitor tables:', migrateErr.message);
    }
    // Recreate tables with new UUID id
    await VisitorLog.sync();
    await VisitorDailySummary.sync();

    await SystemConfig.sync();
    await initDefaultConfig({
      embedding_base_url: '',
      embedding_model: '',
      embedding_api_key: '',
    });
    startDailyResetScheduler();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.log('Application will run without database persistence');
  }

  return app;
}

export default createApp;
