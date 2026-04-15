const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit contact form');
    }

    return response.json();
  },

  async getAll(): Promise<ContactResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/contact`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }

    return response.json();
  },
};
