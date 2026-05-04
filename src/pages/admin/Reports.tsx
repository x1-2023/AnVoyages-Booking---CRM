import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import { BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BadgePercent, CalendarCheck, DollarSign, TrendingUp, Users } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportService, ReportOverview } from '@/services/report.service';
import { useToast } from '@/hooks/use-toast';

const colors = ['#0f766e', '#2563eb', '#f59e0b', '#dc2626', '#7c3aed'];
const currency = (value: number) => value.toLocaleString('vi-VN') + 'đ';

export default function Reports() {
  const { toast } = useToast();
  const [data, setData] = useState<ReportOverview | null>(null);

  useEffect(() => {
    reportService.overview()
      .then(setData)
      .catch((error) => toast({
        title: 'Không tải được báo cáo',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      }));
  }, [toast]);

  const sourceData = Object.entries(data?.leadSources ?? {}).map(([name, value]) => ({ name, value }));
  const destinationData = Object.entries(data?.destinationBookings ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <AdminPage>
      <AdminPageHeader title="Báo cáo" description="Doanh thu, lợi nhuận, nguồn khách và hiệu quả chuyển đổi lead." />

      <AdminStatsGrid>
        <Metric icon={CalendarCheck} label="Booking" value={String(data?.totals.bookings ?? 0)} />
        <Metric icon={Users} label="Lead" value={String(data?.totals.leads ?? 0)} />
        <Metric icon={DollarSign} label="Doanh thu" value={currency(data?.totals.revenue ?? 0)} />
        <Metric icon={TrendingUp} label="Lợi nhuận" value={currency(data?.totals.profit ?? 0)} />
        <Metric icon={BadgePercent} label="Conversion" value={`${data?.totals.conversionRate ?? 0}%`} />
      </AdminStatsGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Nguồn lead</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {sourceData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Booking theo điểm đến</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top khách hàng</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(data?.topCustomers ?? []).map((customer) => (
            <div key={customer.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone ?? '-'}</p>
              </div>
              <p className="font-semibold">{currency(customer.totalSpent)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
