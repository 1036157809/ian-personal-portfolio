import Router from '@koa/router';
import configController from '../controllers/config.controller';

const router = new Router({ prefix: '/api/config' });

router.get('/', (ctx) => configController.getAll(ctx));
router.put('/:key', (ctx) => configController.update(ctx));

export default router;
