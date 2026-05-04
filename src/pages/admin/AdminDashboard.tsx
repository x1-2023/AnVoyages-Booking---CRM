import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Home, KanbanSquare, MapPin, Settings, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardService } from '@/services/dashboard.service';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalProperties: number;
  totalLocations: number;
  pendingBookings: number;
  activeProperties: number;
}

const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

const quickActions = [
  { to: '/admin/leads', label: 'Xử lý lead', icon: KanbanSquare },
  { to: '/admin/bookings', label: 'Quản lý booking', icon: Calendar },
  { to: '/admin/properties', label: 'Sản phẩm du lịch', icon: Home },
  { to: '/admin/settings', label: 'Cài đặt website', icon: Settings },
];

const operationCards = [
  {
    title: 'Lead & khách hàng',
    description: 'Theo dõi nguồn lead, lịch sử tư vấn và hồ sơ khách trong cùng một timeline.',
    icon: Users,
  },
  {
    title: 'Booking & thanh toán',
    description: 'Quản lý báo giá, xác nhận, tiền cọc, thanh toán đủ và nội dung chuyển khoản Sepay.',
    icon: Calendar,
  },
  {
    title: 'Sản phẩm du lịch',
    description: 'Duy trì tour, combo, du thuyền, khách sạn, thuê xe và rule giá theo mùa.',
    icon: Home,
  },
  {
    title: 'Nội dung & SEO',
    description: 'Quản trị điểm đến, blog, sitemap và metadata phục vụ tăng trưởng organic.',
    icon: TrendingUp,
  },
];

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
  delay,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Calendar;
  tone: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="overflow-hidden rounded-3xl bg-card/90 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{note}</p>
            </div>
            <div className={`rounded-2xl p-3 ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getOverview();
      setStats({
        totalBookings: data.bookings?.total || 0,
        totalRevenue: data.revenue?.total || 0,
        totalProperties: data.resources?.activeProperties || 0,
        totalLocations: data.resources?.activeLocations || 0,
        pendingBookings: data.bookings?.pending || 0,
        activeProperties: data.resources?.activeProperties || 0,
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(error, 'Không thể tải dữ liệu dashboard'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader
          title="Tổng quan vận hành"
          description="Theo dõi booking, doanh thu, lead và sản phẩm đang hoạt động."
        />
        <div className="flex h-64 items-center justify-center rounded-3xl border bg-card/80 shadow-sm">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Tổng quan vận hành"
        description="Bảng điều khiển cho booking, lead, doanh thu, sản phẩm du lịch và nội dung tăng trưởng."
        actions={
          <Link to="/admin/bookings">
            <Button className="rounded-xl bg-gradient-cta shadow-accent">Xem booking</Button>
          </Link>
        }
      />

      <AdminStatsGrid>
        <StatCard
          label="Tổng booking"
          value={stats?.totalBookings || 0}
          note={`${stats?.pendingBookings || 0} booking chờ xử lý`}
          icon={Calendar}
          tone="bg-blue-50 text-blue-600"
          delay={0}
        />
        <StatCard
          label="Doanh thu"
          value={`${stats?.totalRevenue?.toLocaleString('vi-VN')}đ`}
          note="Tổng doanh thu đã ghi nhận"
          icon={DollarSign}
          tone="bg-emerald-50 text-emerald-600"
          delay={0.08}
        />
        <StatCard
          label="Sản phẩm du lịch"
          value={stats?.totalProperties || 0}
          note={`${stats?.activeProperties || 0} sản phẩm đang bán`}
          icon={Home}
          tone="bg-violet-50 text-violet-600"
          delay={0.16}
        />
        <StatCard
          label="Điểm đến"
          value={stats?.totalLocations || 0}
          note="Khu vực đang có inventory"
          icon={MapPin}
          tone="bg-orange-50 text-orange-600"
          delay={0.24}
        />
      </AdminStatsGrid>

      <Card className="rounded-3xl bg-card/90 shadow-sm">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Thao tác nhanh</h2>
              <p className="mt-1 text-sm text-muted-foreground">Đi thẳng tới các khu vực vận hành dùng hằng ngày.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.to} to={action.to}>
                  <Button variant="outline" className="h-11 w-full justify-start gap-2 rounded-xl bg-background">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        {operationCards.map((card) => (
          <Card key={card.title} className="rounded-3xl bg-card/90 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold tracking-tight">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
