import Router from '@koa/router';
import contactController from 'src/controllers/contact.controller';

const router = new Router({
  prefix: '/api/contact',
});

router.post('/', contactController.create.bind(contactController));
router.get('/', contactController.findAll.bind(contactController));
router.get('/:id', contactController.findById.bind(contactController));
router.delete('/:id', contactController.delete.bind(contactController));

export default router;
