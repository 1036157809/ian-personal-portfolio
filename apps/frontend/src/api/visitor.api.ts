import { request } from 'src/utils/request';
import type { VisitorStats } from '@ianportfolio/shared';

export { type VisitorStats };

export const visitorApi = {
  async recordVisit(): Promise<{ success: boolean; isNewVisitor: boolean }> {
    return request<{ success: boolean; isNewVisitor: boolean }>('/visitor/record', {
      method: 'POST',
    });
  },

  async getStats(): Promise<VisitorStats> {
    return request<VisitorStats>('/visitor/stats');
  },

  async getLocation(): Promise<{ country: string; isChineseRegion: boolean }> {
    return request<{ country: string; isChineseRegion: boolean }>('/visitor/location');
  },
};
