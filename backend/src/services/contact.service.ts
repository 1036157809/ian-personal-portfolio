import { Contact } from '../models/contact.model';
import { Contact as ContactType } from '../types';
import { Transaction } from 'sequelize';

export class ContactService {
  async create(contactData: Omit<ContactType, 'id' | 'createdAt'>, t?: Transaction): Promise<ContactType> {
    try {
      const contact = await Contact.create(contactData, { transaction: t });
      return contact.toJSON() as ContactType;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact');
    }
  }

  async findAll(t?: Transaction): Promise<ContactType[]> {
    try {
      const contacts = await Contact.findAll({
        order: [['createdAt', 'DESC']],
        transaction: t
      });
      return contacts.map(contact => contact.toJSON() as ContactType);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  async findById(id: string, t?: Transaction): Promise<ContactType | null> {
    try {
      const contact = await Contact.findByPk(id, { transaction: t });
      return contact ? contact.toJSON() as ContactType : null;
    } catch (error) {
      console.error('Error finding contact:', error);
      throw new Error('Failed to find contact');
    }
  }

  async delete(id: string, t?: Transaction): Promise<boolean> {
    try {
      const deleted = await Contact.destroy({ where: { id }, transaction: t });
      return deleted > 0;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw new Error('Failed to delete contact');
    }
  }

  async createWithTransaction(contactData: Omit<ContactType, 'id' | 'createdAt'>): Promise<ContactType> {
    const t = await Contact.sequelize!.transaction();
    try {
      const contact = await this.create(contactData, t);
      await t.commit();
      return contact;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deleteWithTransaction(id: string): Promise<boolean> {
    const t = await Contact.sequelize!.transaction();
    try {
      const deleted = await this.delete(id, t);
      await t.commit();
      return deleted;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new ContactService();
