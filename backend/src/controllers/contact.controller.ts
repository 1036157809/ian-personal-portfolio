import { Context } from 'koa';
import contactService from '../services/contact.service';
import { Contact as ContactType } from '../types';

export class ContactController {
  async create(ctx: Context) {
    try {
      console.log('=== Contact Form Submission ===');
      console.log('Request body:', ctx.request.body);

      const { name, email, message } = ctx.request.body as {
        name?: string;
        email?: string;
        message?: string;
      };

      if (!name || !email || !message) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields: name, email, message' };
        return;
      }

      const contact = await contactService.createWithTransaction({ name, email, message });
      console.log('Contact saved successfully:', contact);

      ctx.status = 201;
      ctx.body = contact;
    } catch (error) {
      console.error('Contact form error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to submit contact form', details: (error as Error).message };
    }
  }

  async findAll(ctx: Context) {
    try {
      const contacts = await contactService.findAll();
      console.log('Fetched contacts from database:', contacts.length);
      ctx.body = contacts;
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch contacts' };
    }
  }

  async findById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const contact = await contactService.findById(id);
      
      if (!contact) {
        ctx.status = 404;
        ctx.body = { error: 'Contact not found' };
        return;
      }

      ctx.body = contact;
    } catch (error) {
      console.error('Failed to find contact:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to find contact' };
    }
  }

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      const deleted = await contactService.deleteWithTransaction(id);
      
      if (!deleted) {
        ctx.status = 404;
        ctx.body = { error: 'Contact not found' };
        return;
      }

      ctx.body = { message: 'Contact deleted successfully' };
    } catch (error) {
      console.error('Failed to delete contact:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to delete contact' };
    }
  }
}

export default new ContactController();
