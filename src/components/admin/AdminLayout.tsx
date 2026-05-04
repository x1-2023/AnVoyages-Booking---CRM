import {
  BarChart3,
  Bell,
  Bot,
  Calendar,
  FileText,
  Home,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  MapPin,
  PanelLeft,
  Settings,
  Ship,
  Users,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Lead pipeline', to: '/admin/leads', icon: KanbanSquare },
  { label: 'Booking', to: '/admin/bookings', icon: Calendar },
  { label: 'Tour/Sản phẩm', to: '/admin/properties', icon: Home },
  { label: 'Điểm đến', to: '/admin/locations', icon: MapPin },
  { label: 'Blog', to: '/admin/blog', icon: FileText },
  { label: 'Khách hàng', to: '/admin/customers', icon: Users },
  { label: 'Nhà cung cấp', to: '/admin/suppliers', icon: Ship },
  { label: 'Báo cáo', to: '/admin/reports', icon: BarChart3 },
  { label: 'Tích hợp', to: '/admin/integrations', icon: Bot },
  { label: 'Cài đặt', to: '/admin/settings', icon: Settings },
];

const mobileNavItems = navItems.slice(0, 5);

const breadcrumbMap: Array<{ matcher: RegExp; items: string[] }> = [
  { matcher: /^\/admin$/, items: ['Tổng quan'] },
  { matcher: /^\/admin\/leads$/, items: ['Lead pipeline'] },
  { matcher: /^\/admin\/bookings$/, items: ['Booking'] },
  { matcher: /^\/admin\/properties$/, items: ['Tour/Sản phẩm'] },
  { matcher: /^\/admin\/properties\/new$/, items: ['Tour/Sản phẩm', 'Thêm mới'] },
  { matcher: /^\/admin\/properties\/[^/]+\/edit$/, items: ['Tour/Sản phẩm', 'Chỉnh sửa'] },
  { matcher: /^\/admin\/locations$/, items: ['Điểm đến'] },
  { matcher: /^\/admin\/locations\/new$/, items: ['Điểm đến', 'Thêm mới'] },
  { matcher: /^\/admin\/locations\/[^/]+\/edit$/, items: ['Điểm đến', 'Chỉnh sửa'] },
  { matcher: /^\/admin\/blog$/, items: ['Blog'] },
  { matcher: /^\/admin\/blog\/new$/, items: ['Blog', 'Viết bài mới'] },
  { matcher: /^\/admin\/blog\/[^/]+\/edit$/, items: ['Blog', 'Chỉnh sửa'] },
  { matcher: /^\/admin\/customers$/, items: ['Khách hàng'] },
  { matcher: /^\/admin\/suppliers$/, items: ['Nhà cung cấp'] },
  { matcher: /^\/admin\/reports$/, items: ['Báo cáo'] },
  { matcher: /^\/admin\/integrations$/, items: ['Tích hợp & Automation'] },
  { matcher: /^\/admin\/settings$/, items: ['Cài đặt'] },
];

function getBreadcrumbs(pathname: string) {
  return breadcrumbMap.find((item) => item.matcher.test(pathname))?.items ?? ['Admin'];
}

function isActivePath(pathname: string, item: (typeof navItems)[number]) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1] ?? 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/admin/login');
    toast({
      title: 'Đã đăng xuất',
      description: 'Bạn đã đăng xuất thành công',
    });
  };

  return (
    <SidebarProvider className="admin-app bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.10),transparent_32rem),linear-gradient(180deg,hsl(210_40%_99%),hsl(210_28%_96%))]">
        <Sidebar collapsible="icon" variant="inset" className="border-r-0">
          <SidebarHeader className="px-3 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  tooltip="An Voyages Admin"
                  className="h-12 rounded-2xl bg-sidebar-accent/80 shadow-sm data-[state=open]:bg-sidebar-accent"
                >
                  <Link to="/admin">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground shadow-accent">
                      <PanelLeft className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold tracking-tight">An Voyages</span>
                      <span className="truncate text-xs text-sidebar-foreground/55">Travel CRM Suite</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarSeparator className="mx-3 w-auto" />

          <SidebarContent className="px-2 py-3">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                Vận hành
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActivePath(location.pathname, item)}
                        className="h-10 rounded-xl font-medium transition-all data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                      >
                        <NavLink to={item.to} end={item.exact}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-3 pb-4">
            <div className="mb-2 rounded-2xl border bg-card/80 p-3 text-xs shadow-sm group-data-[collapsible=icon]:hidden">
              <p className="font-semibold text-foreground">CRM sẵn sàng mở rộng</p>
              <p className="mt-1 text-muted-foreground">Lead, booking, Sepay và automation cùng một lõi dữ liệu.</p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Về trang chủ" className="rounded-xl">
                  <Link to="/">
                    <Home />
                    <span>Về trang chủ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Đăng xuất" onClick={handleLogout} className="rounded-xl">
                  <LogOut />
                  <span>Đăng xuất</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-w-0 bg-transparent">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 px-3 py-3 backdrop-blur-xl md:px-6">
            <div className="flex min-h-12 items-center gap-3">
              <SidebarTrigger className="size-10 rounded-xl border bg-card shadow-sm" />
              <div className="min-w-0 flex-1">
                <Breadcrumb className="hidden md:block">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/admin">Admin</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {breadcrumbs.map((crumb, index) => {
                      const isLast = index === breadcrumbs.length - 1;
                      return (
                        <BreadcrumbItem key={`${crumb}-${index}`}>
                          {isLast ? <BreadcrumbPage>{crumb}</BreadcrumbPage> : <span>{crumb}</span>}
                        </BreadcrumbItem>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="truncate text-base font-semibold text-foreground md:hidden">{pageTitle}</div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <div className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                  Admin workspace
                </div>
                <Button variant="outline" size="icon" className="size-10 rounded-xl bg-card shadow-sm">
                  <Bell className="size-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-10 rounded-xl bg-card shadow-sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-73px)]">
            <Outlet />
          </main>
        </SidebarInset>

        <nav className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border bg-background/95 p-1.5 shadow-xl backdrop-blur-xl md:hidden">
          <div className="grid grid-cols-5 gap-1">
            {mobileNavItems.map((item) => {
              const active = isActivePath(location.pathname, item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold transition ${
                    active ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="size-4" />
                  <span className="max-w-full truncate">{item.label.replace('Tour/Sản phẩm', 'Sản phẩm')}</span>
                </Link>
              );
            })}
          </div>
        </nav>
    </SidebarProvider>
  );
}
