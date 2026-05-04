import { api } from '@/lib/api';

export const dashboardService = {
  async getOverview(startDate?: string, endDate?: string) {
    const response = await api.get('/dashboard/overview', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getRevenueByLocation(startDate?: string, endDate?: string) {
    const response = await api.get('/dashboard/revenue/by-location', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getRevenueByProperty(locationId?: string, startDate?: string, endDate?: string) {
    const response = await api.get('/dashboard/revenue/by-property', {
      params: { locationId, startDate, endDate },
    });
    return response.data;
  },

  async getRevenueByMonth(year: number) {
    const response = await api.get('/dashboard/revenue/by-month', {
      params: { year },
    });
    return response.data;
  },

  async getTopProperties(limit = 10, startDate?: string, endDate?: string) {
    const response = await api.get('/dashboard/top-properties', {
      params: { limit, startDate, endDate },
    });
    return response.data;
  },

  async getRecentBookings(limit = 10) {
    const response = await api.get('/dashboard/recent-bookings', {
      params: { limit },
    });
    return response.data;
  },
};
