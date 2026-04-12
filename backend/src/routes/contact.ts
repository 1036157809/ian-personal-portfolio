import Router from '@koa/router'
import { Contact } from '../database';

const router = new Router({
  prefix: '/api/contact',
});

// Submit contact form
router.post('/', async (ctx) => {
  try {
    const { name, email, message } = ctx.request.body;
    
    if (!name || !email || !message) {
      ctx.status = 400;
      ctx.body = { error: 'Name, email, and message are required' };
      return;
    }
    
    const contact = await Contact.create({ name, email, message });
    ctx.body = { message: 'Contact form submitted successfully', contact };
    ctx.status = 201;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to submit contact form' };
  }
});

// Get all contacts (admin only - simplified for demo)
router.get('/', async (ctx) => {
  try {
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']],
    });
    ctx.body = contacts;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch contacts' };
  }
});

export default router;
