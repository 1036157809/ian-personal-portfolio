import Router from '@koa/router';
import chatController from '../controllers/chat.controller';

const router = new Router({ prefix: '/api/chat' });

router.post('/', (ctx) => chatController.chat(ctx));
router.post('/stream', (ctx) => chatController.chatStream(ctx));
router.post('/index', (ctx) => chatController.index(ctx));

export default router;
