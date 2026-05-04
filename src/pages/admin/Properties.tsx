import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, Filter, MapPin, MoreHorizontal, PackageOpen, Plus, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductCategory, Property, propertyService } from '@/services/property.service';
import { useToast } from '@/hooks/use-toast';

const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const formatCurrency = (value?: number) => `${(value || 0).toLocaleString('vi-VN')}đ`;
const getPricingRuleCount = (product: Property) => product.pricingRules?.length || 0;

export default function AdminProperties() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Property[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryLabels = useMemo(() => {
    const labels: Record<string, string> = {
      hotel: 'Khách sạn',
      homestay: 'Homestay',
      tour: 'Tour',
      cruise: 'Du thuyền',
    };
    categories.forEach((category) => {
      labels[category.slug] = category.name;
    });
    return labels;
  }, [categories]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { isActive: filter === 'active' } : undefined;
      const [productData, categoryData] = await Promise.all([
        propertyService.getAll(params),
        propertyService.getCategories(true),
      ]);
      setProducts(productData);
      setCategories(categoryData);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(error, 'Không thể tải danh sách sản phẩm du lịch'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm du lịch này?')) return;

    try {
      await propertyService.delete(id);
      toast({ title: 'Thành công', description: 'Đã xóa sản phẩm du lịch' });
      loadProducts();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(error, 'Không thể xóa sản phẩm du lịch'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await propertyService.update(id, { isActive: !currentStatus });
      toast({
        title: 'Thành công',
        description: `Đã ${!currentStatus ? 'kích hoạt' : 'ẩn'} sản phẩm du lịch`,
      });
      loadProducts();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(error, 'Không thể cập nhật trạng thái'),
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (categoryLabels[product.type] || product.type).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'outline'}>{isActive ? 'Đang hiển thị' : 'Đang ẩn'}</Badge>
  );

  const getTypeBadge = (type: string) => <Badge variant="secondary">{categoryLabels[type] || type}</Badge>;

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader title="Quản lý sản phẩm du lịch" description="Tour, combo, khách sạn, du thuyền và dịch vụ du lịch." />
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Quản lý sản phẩm du lịch"
        description="Quản lý tour, combo, du thuyền, khách sạn, thuê xe và các dịch vụ có thể đặt."
        actions={
          <Link to="/admin/properties/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, điểm đến, phân loại..."
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hiển thị</SelectItem>
                <SelectItem value="inactive">Đang ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <AdminStatsGrid>
        <Metric label="Tổng sản phẩm" value={products.length} />
        <Metric label="Đang hiển thị" value={products.filter((product) => product.isActive).length} />
        <Metric label="Phân loại" value={new Set(products.map((product) => product.type)).size} />
        <Metric label="Có mùa giá" value={products.filter((product) => getPricingRuleCount(product) > 0).length} />
      </AdminStatsGrid>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Điểm đến</TableHead>
              <TableHead>Phân loại</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Nền giá</TableHead>
              <TableHead>Sức chứa</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {product.location?.name || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(product.type)}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(product.basePrice)}</TableCell>
                <TableCell className="text-sm">
                  <div>NL: {formatCurrency(product.adultPrice || product.basePrice)}</div>
                  <div className="text-muted-foreground">
                    TE: {product.childPrice ? formatCurrency(product.childPrice) : 'Chưa đặt'}
                    {getPricingRuleCount(product) > 0 ? ` · ${getPricingRuleCount(product)} mùa` : ''}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{product.maxGuests || 0} khách</TableCell>
                <TableCell>{getStatusBadge(product.isActive)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/properties/${product.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(product.id, product.isActive)}>
                        {product.isActive ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredProducts.length === 0 && (
        <AdminEmptyState
          icon={<PackageOpen className="mx-auto h-12 w-12" />}
          title="Không có sản phẩm du lịch nào"
          description={searchQuery || filter !== 'all' ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc.' : 'Chưa có sản phẩm nào trong hệ thống.'}
          action={
            <Link to="/admin/properties/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm sản phẩm đầu tiên
              </Button>
            </Link>
          }
        />
      )}
    </AdminPage>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <PackageOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
