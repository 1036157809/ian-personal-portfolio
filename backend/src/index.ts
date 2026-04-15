import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { koaBody } from 'koa-body';
import path from 'path';
import Router from '@koa/router';
import cron from 'node-cron';
import contactRoutes from './routes/contact';
import fileRoutes from './routes/files';
import { cleanupUploads } from './utils/fileCleanup';

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(process.cwd(), 'uploads', 'temp'),
    keepExtensions: true,
  }
}));

// Routes
router.get('/', (ctx) => {
  ctx.body = { message: 'Ian Portfolio API' };
});

app.use(router.routes());
app.use(router.allowedMethods());

// API Routes
app.use(contactRoutes.routes());
app.use(contactRoutes.allowedMethods());
app.use(fileRoutes.routes());
app.use(fileRoutes.allowedMethods());

// Initialize database and start server
async function start() {
  try {
    // Run cleanup silently on startup (only if needed)
    await cleanupUploads();
    
    // Schedule file cleanup to run every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running scheduled file cleanup...');
      await cleanupUploads();
    });
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
