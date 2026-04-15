import Router from '@koa/router'

const router = new Router({
  prefix: '/api/contact',
});

// Simple in-memory storage for contact forms
const contacts: any[] = [];

// Submit contact form
router.post('/', async (ctx) => {
  try {
    const body = ctx.request.body as { name?: string; email?: string; message?: string };
    const { name, email, message } = body;
    
    if (!name || !email || !message) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: name, email, message' };
      return;
    }
    
    const contact = {
      id: Date.now().toString(),
      name,
      email,
      message,
      createdAt: new Date()
    };
    
    contacts.push(contact);
    ctx.status = 201;
    ctx.body = contact;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to submit contact form' };
  }
});

// Get all contacts (admin only - simplified for demo)
router.get('/', async (ctx) => {
  try {
    ctx.body = contacts;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch contacts' };
  }
});

export default router;
