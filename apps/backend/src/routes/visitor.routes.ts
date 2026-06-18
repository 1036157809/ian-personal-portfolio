import Router from '@koa/router';
import visitorController from '../controllers/visitor.controller';

const router = new Router({ prefix: '/api/visitor' });

router.post('/record', (ctx) => visitorController.record(ctx));
router.get('/stats', (ctx) => visitorController.stats(ctx));
router.get('/location', (ctx) => visitorController.location(ctx));

export default router;
