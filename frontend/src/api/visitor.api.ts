import { request } from 'src/utils/request';

export interface VisitorStats {
  today: { uv: number; pv: number };
  total: { uv: number; pv: number };
  recent7days: Array<{ date: string; uv: number; pv: number }>;
}

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
