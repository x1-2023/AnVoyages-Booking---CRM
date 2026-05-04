import { api } from '@/lib/api';

export interface ReportOverview {
  totals: {
    bookings: number;
    leads: number;
    customers: number;
    revenue: number;
    profit: number;
    conversionRate: number;
  };
  leadSources: Record<string, number>;
  destinationBookings: Record<string, number>;
  recentBookings: unknown[];
  topCustomers: Array<{ id: string; name: string; phone?: string; totalSpent: number }>;
}

export const reportService = {
  async overview() {
    const response = await api.get('/reports/overview');
    return response.data as ReportOverview;
  },
};
