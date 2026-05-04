import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';

type DashboardOverview = {
  bookings?: { total?: number; pending?: number; completed?: number; cancelled?: number };
  revenue?: { total?: number; paid?: number; unpaid?: number };
  resources?: { activeLocations?: number; activeProperties?: number };
};

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Failed to load dashboard';

export default function DashboardExample() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getOverview();
      setOverview(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <div className="p-8"><h1 className="mb-4 text-2xl font-bold">Loading dashboard...</h1></div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold text-red-500">Error</h1>
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-600">Make sure you're logged in and have a valid token.</p>
        <button onClick={loadDashboard} className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard from Backend API</h1>
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"><p className="text-green-800">Successfully connected to backend dashboard.</p></div>
      {overview && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-blue-50 p-4"><h3 className="mb-2 font-semibold">Bookings</h3><p className="text-3xl font-bold">{overview.bookings?.total || 0}</p><div className="mt-2 space-y-1 text-sm"><p>Pending: {overview.bookings?.pending || 0}</p><p>Completed: {overview.bookings?.completed || 0}</p><p>Cancelled: {overview.bookings?.cancelled || 0}</p></div></div>
          <div className="rounded-lg border bg-green-50 p-4"><h3 className="mb-2 font-semibold">Revenue</h3><p className="text-2xl font-bold">{formatCurrency(overview.revenue?.total || 0)}</p><div className="mt-2 space-y-1 text-sm"><p>Paid: {formatCurrency(overview.revenue?.paid || 0)}</p><p>Unpaid: {formatCurrency(overview.revenue?.unpaid || 0)}</p></div></div>
          <div className="rounded-lg border bg-purple-50 p-4"><h3 className="mb-2 font-semibold">Active Locations</h3><p className="text-3xl font-bold">{overview.resources?.activeLocations || 0}</p></div>
          <div className="rounded-lg border bg-orange-50 p-4"><h3 className="mb-2 font-semibold">Active Properties</h3><p className="text-3xl font-bold">{overview.resources?.activeProperties || 0}</p></div>
        </div>
      )}
    </div>
  );
}
