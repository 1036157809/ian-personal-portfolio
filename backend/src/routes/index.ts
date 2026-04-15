import Router from '@koa/router';
import contactRoutes from './contact.routes';
import fileRoutes from './file.routes';

const router = new Router();

// Health check
router.get('/', (ctx) => {
  ctx.body = { message: 'Ian Portfolio API' };
});

// API routes
router.use(contactRoutes.routes());
router.use(contactRoutes.allowedMethods());
router.use(fileRoutes.routes());
router.use(fileRoutes.allowedMethods());

export default router;
