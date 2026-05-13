import { request } from 'src/utils/request';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export const contactApi = {
  async submit(formData: ContactFormData): Promise<ContactResponse> {
    return request<ContactResponse>('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },

  async getAll(): Promise<ContactResponse[]> {
    return request<ContactResponse[]>('/contact');
  },
};
