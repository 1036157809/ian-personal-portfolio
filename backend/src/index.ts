import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';
import cron from 'node-cron';
import { initDatabase } from './database';
import projectRoutes from './routes/projects';
import contactRoutes from './routes/contact';
import fileRoutes from './routes/files';
import { cleanupUploads } from './utils/fileCleanup';

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser());

// Routes
router.get('/', (ctx) => {
  ctx.body = { message: 'Ian Portfolio API' };
});

app.use(router.routes());
app.use(router.allowedMethods());

// API Routes
app.use(projectRoutes.routes());
app.use(projectRoutes.allowedMethods());
app.use(contactRoutes.routes());
app.use(contactRoutes.allowedMethods());
app.use(fileRoutes.routes());
app.use(fileRoutes.allowedMethods());

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    
    // Schedule file cleanup to run every day at 2 AM
    cron.schedule('0 2 * * *', () => {
      console.log('Running scheduled file cleanup...');
      cleanupUploads();
    });
    
    // Run cleanup on startup as well
    console.log('Running initial file cleanup on startup...');
    cleanupUploads();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
