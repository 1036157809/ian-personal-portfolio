import Router from '@koa/router';
import contactRoutes from './contact.routes';
import fileRoutes from './file.routes';
import openskyRoutes from './opensky.routes';
import visitorRoutes from './visitor.routes';
import configRoutes from './config.routes';
import { chatRoutes } from '../ai-assistant';

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
router.use(openskyRoutes.routes());
router.use(openskyRoutes.allowedMethods());
router.use(visitorRoutes.routes());
router.use(visitorRoutes.allowedMethods());
router.use(chatRoutes.routes());
router.use(chatRoutes.allowedMethods());
router.use(configRoutes.routes());
router.use(configRoutes.allowedMethods());

export default router;
