import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import path from 'path';
import router from '../routes';
import errorHandler from '../middlewares/error.middleware';
import logger from '../middlewares/logger.middleware';
import { sequelize, testConnection } from '../config';
import Contact from '../models/contact.model';

export async function createApp(): Promise<Koa> {
  const app = new Koa();

  // Middlewares
  app.use(cors());
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
    await Contact.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.log('Application will run without database persistence');
  }

  return app;
}

export default createApp;
