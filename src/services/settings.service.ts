import { api } from '@/lib/api';

export const settingsService = {
  async getAll() {
    const response = await api.get('/settings');
    return response.data;
  },

  async getAdminAll() {
    const response = await api.get('/settings/admin/all');
    return response.data;
  },

  async getSetting(key: string) {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },

  async updateSetting(key: string, value: string) {
    const response = await api.put(`/settings/${key}`, { value });
    return response.data;
  },

  async updateMultiple(settings: Record<string, string>) {
    const response = await api.put('/settings', { settings });
    return response.data;
  },

  async initializeDefaults() {
    const response = await api.post('/settings/initialize');
    return response.data;
  },

  async deleteSetting(key: string) {
    const response = await api.delete(`/settings/${key}`);
    return response.data;
  },
};
