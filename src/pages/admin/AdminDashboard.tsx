import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Home,
  MapPin,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Menu,
  X,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockBookings = [
  { id: 1, guest: "Nguyễn Văn A", property: "Villa Biển Xanh", checkIn: "2024-01-15", checkOut: "2024-01-20", status: "confirmed", total: "12,500,000₫" },
  { id: 2, guest: "Trần Thị B", property: "Căn hộ Sunset", checkIn: "2024-01-18", checkOut: "2024-01-22", status: "pending", total: "8,200,000₫" },
  { id: 3, guest: "Lê Văn C", property: "Nhà gỗ núi rừng", checkIn: "2024-01-20", checkOut: "2024-01-25", status: "confirmed", total: "15,000,000₫" },
  { id: 4, guest: "Phạm Thị D", property: "Resort Đà Lạt", checkIn: "2024-01-22", checkOut: "2024-01-28", status: "cancelled", total: "22,000,000₫" },
  { id: 5, guest: "Hoàng Văn E", property: "Villa Biển Xanh", checkIn: "2024-01-25", checkOut: "2024-01-30", status: "confirmed", total: "12,500,000₫" },
];

const mockProperties = [
  { id: 1, name: "Villa Biển Xanh", location: "Đà Nẵng", price: "2,500,000₫/đêm", status: "active", bookings: 24, rating: 4.9 },
  { id: 2, name: "Căn hộ Sunset", location: "Nha Trang", price: "1,800,000₫/đêm", status: "active", bookings: 18, rating: 4.7 },
  { id: 3, name: "Nhà gỗ núi rừng", location: "Đà Lạt", price: "3,000,000₫/đêm", status: "maintenance", bookings: 12, rating: 4.8 },
  { id: 4, name: "Resort Đà Lạt", location: "Đà Lạt", price: "4,500,000₫/đêm", status: "active", bookings: 32, rating: 4.9 },
  { id: 5, name: "Biệt thự Phú Quốc", location: "Phú Quốc", price: "5,200,000₫/đêm", status: "active", bookings: 28, rating: 4.6 },
];

const mockDestinations = [
  { id: 1, name: "Đà Nẵng", properties: 45, views: 12500, status: "featured" },
  { id: 2, name: "Nha Trang", properties: 38, views: 9800, status: "active" },
  { id: 3, name: "Đà Lạt", properties: 52, views: 15200, status: "featured" },
  { id: 4, name: "Phú Quốc", properties: 34, views: 8900, status: "active" },
  { id: 5, name: "Hội An", properties: 28, views: 7600, status: "active" },
];

const mockBlogs = [
  { id: 1, title: "Top 10 điểm đến mùa hè 2024", author: "Admin", date: "2024-01-10", status: "published", views: 2450 },
  { id: 2, title: "Hướng dẫn du lịch Đà Lạt", author: "Editor", date: "2024-01-08", status: "published", views: 1820 },
  { id: 3, title: "Review Villa Biển Xanh", author: "Admin", date: "2024-01-05", status: "draft", views: 0 },
  { id: 4, title: "Kinh nghiệm đặt phòng giá tốt", author: "Editor", date: "2024-01-03", status: "published", views: 3100 },
  { id: 5, title: "Ẩm thực Phú Quốc", author: "Admin", date: "2024-01-01", status: "published", views: 1560 },
];

const sidebarItems = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "bookings", label: "Đặt phòng", icon: Calendar },
  { id: "properties", label: "Bất động sản", icon: Home },
  { id: "destinations", label: "Điểm đến", icon: MapPin },
  { id: "blog", label: "Blog", icon: FileText },
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      active: "default",
      published: "default",
      featured: "default",
      pending: "secondary",
      draft: "secondary",
      cancelled: "destructive",
      maintenance: "outline",
    };
    const labels: Record<string, string> = {
      confirmed: "Đã xác nhận",
      pending: "Chờ xử lý",
      cancelled: "Đã hủy",
      active: "Hoạt động",
      maintenance: "Bảo trì",
      published: "Đã xuất bản",
      draft: "Bản nháp",
      featured: "Nổi bật",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        className="fixed left-0 top-0 h-full bg-card border-r border-border z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <Link to="/" className="font-display text-xl font-bold text-primary">
              TravelNest
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t border-border">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start gap-2">
              <ChevronLeft className="h-4 w-4" />
              {sidebarOpen && "Về trang chủ"}
            </Button>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-[72px]"
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <h1 className="text-xl font-display font-semibold text-foreground">
            {sidebarItems.find((item) => item.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                className="pl-9 w-64"
              />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === "overview" && <OverviewSection />}
          {activeTab === "bookings" && <BookingsSection bookings={mockBookings} getStatusBadge={getStatusBadge} />}
          {activeTab === "properties" && <PropertiesSection properties={mockProperties} getStatusBadge={getStatusBadge} />}
          {activeTab === "destinations" && <DestinationsSection destinations={mockDestinations} getStatusBadge={getStatusBadge} />}
          {activeTab === "blog" && <BlogSection blogs={mockBlogs} getStatusBadge={getStatusBadge} />}
        </div>
      </main>
    </div>
  );
};

// Overview Section
const OverviewSection = () => {
  const stats = [
    { label: "Tổng đặt phòng", value: "1,234", change: "+12%", icon: Calendar, color: "text-blue-500" },
    { label: "Doanh thu", value: "2.5 tỷ₫", change: "+8%", icon: DollarSign, color: "text-green-500" },
    { label: "Lượt xem", value: "45,678", change: "+23%", icon: Eye, color: "text-purple-500" },
    { label: "Khách hàng mới", value: "892", change: "+5%", icon: Users, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đặt phòng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{booking.guest}</p>
                    <p className="text-sm text-muted-foreground">{booking.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{booking.total}</p>
                    <p className="text-sm text-muted-foreground">{booking.checkIn}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bất động sản hàng đầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProperties.slice(0, 4).map((property) => (
                <div key={property.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{property.name}</p>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">⭐ {property.rating}</p>
                    <p className="text-sm text-muted-foreground">{property.bookings} đặt phòng</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Bookings Section
const BookingsSection = ({ bookings, getStatusBadge }: { bookings: typeof mockBookings; getStatusBadge: (status: string) => JSX.Element }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground">Quản lý tất cả đặt phòng</p>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Thêm đặt phòng
      </Button>
    </div>
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Bất động sản</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.guest}</TableCell>
              <TableCell>{booking.property}</TableCell>
              <TableCell>{booking.checkIn}</TableCell>
              <TableCell>{booking.checkOut}</TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell>{booking.total}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);

// Properties Section
const PropertiesSection = ({ properties, getStatusBadge }: { properties: typeof mockProperties; getStatusBadge: (status: string) => JSX.Element }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground">Quản lý bất động sản cho thuê</p>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Thêm bất động sản
      </Button>
    </div>
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Địa điểm</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Đặt phòng</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell className="font-medium">{property.name}</TableCell>
              <TableCell>{property.location}</TableCell>
              <TableCell>{property.price}</TableCell>
              <TableCell>{getStatusBadge(property.status)}</TableCell>
              <TableCell>{property.bookings}</TableCell>
              <TableCell>⭐ {property.rating}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);

// Destinations Section
const DestinationsSection = ({ destinations, getStatusBadge }: { destinations: typeof mockDestinations; getStatusBadge: (status: string) => JSX.Element }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground">Quản lý các điểm đến du lịch</p>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Thêm điểm đến
      </Button>
    </div>
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Điểm đến</TableHead>
            <TableHead>Số bất động sản</TableHead>
            <TableHead>Lượt xem</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {destinations.map((destination) => (
            <TableRow key={destination.id}>
              <TableCell className="font-medium">{destination.name}</TableCell>
              <TableCell>{destination.properties} bất động sản</TableCell>
              <TableCell>{destination.views.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(destination.status)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);

// Blog Section
const BlogSection = ({ blogs, getStatusBadge }: { blogs: typeof mockBlogs; getStatusBadge: (status: string) => JSX.Element }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground">Quản lý bài viết blog</p>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Viết bài mới
      </Button>
    </div>
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead>Ngày đăng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lượt xem</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell className="font-medium">{blog.title}</TableCell>
              <TableCell>{blog.author}</TableCell>
              <TableCell>{blog.date}</TableCell>
              <TableCell>{getStatusBadge(blog.status)}</TableCell>
              <TableCell>{blog.views.toLocaleString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);

export default AdminDashboard;
