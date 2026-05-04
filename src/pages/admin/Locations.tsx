import { useCallback, useEffect, useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Plus, Search, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { locationService } from '@/services/location.service';
import { useToast } from '@/hooks/use-toast';

const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  _count?: { properties: number };
  createdAt: string;
}

export default function AdminLocations() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationService.getAll();
      setLocations(data);
    } catch (error) {
      toast({ title: 'Lỗi', description: getErrorMessage(error, 'Không thể tải danh sách địa điểm'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa điểm này?')) return;
    try {
      await locationService.delete(id);
      toast({ title: 'Thành công', description: 'Đã xóa địa điểm' });
      loadLocations();
    } catch (error) {
      toast({ title: 'Lỗi', description: getErrorMessage(error, 'Không thể xóa địa điểm'), variant: 'destructive' });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await locationService.update(id, { isActive: !currentStatus });
      toast({ title: 'Thành công', description: `Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} địa điểm` });
      loadLocations();
    } catch (error) {
      toast({ title: 'Lỗi', description: getErrorMessage(error, 'Không thể cập nhật trạng thái'), variant: 'destructive' });
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLocations = locations.filter((location) => location.isActive).length;
  const uniqueSlugs = new Set(locations.map((location) => location.slug)).size;

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader title="Quản lý địa điểm" description="Quản lý nội dung điểm đến và trạng thái hiển thị." />
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card"><p className="text-muted-foreground">Đang tải...</p></div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Quản lý địa điểm"
        description="Quản lý các điểm đến du lịch."
        actions={<Link to="/admin/locations/new"><Button className="gap-2"><Plus className="h-4 w-4" />Thêm địa điểm</Button></Link>}
      />

      <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Tìm kiếm theo tên, slug..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></CardContent></Card>

      <AdminStatsGrid className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><MapPin className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Tổng địa điểm</p><p className="text-xl font-bold">{locations.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-purple-100 p-2"><MapPin className="h-5 w-5 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Đang hoạt động</p><p className="text-xl font-bold">{activeLocations}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><Globe className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Slug</p><p className="text-xl font-bold">{uniqueSlugs}</p></div></div></CardContent></Card>
      </AdminStatsGrid>

      <div className="space-y-3 md:hidden">
        {filteredLocations.map((location) => (
          <Card key={location.id}><CardContent className="p-4"><div className="space-y-3"><div className="flex items-start justify-between"><div><h3 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" />{location.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Globe className="h-3 w-3" />{location.slug}</p></div><Badge variant={location.isActive ? 'default' : 'outline'}>{location.isActive ? 'Hoạt động' : 'Không hoạt động'}</Badge></div>{location.description && <p className="line-clamp-2 text-sm text-muted-foreground">{location.description}</p>}<div className="flex items-center justify-between border-t pt-2"><div className="text-sm text-muted-foreground">{location._count?.properties || 0} bất động sản</div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to={`/admin/locations/${location.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Chỉnh sửa</Link></DropdownMenuItem><DropdownMenuItem onClick={() => handleToggleActive(location.id, location.isActive)}>{location.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(location.id)}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div></CardContent></Card>
        ))}
      </div>

      <Card className="hidden md:block">
        <Table>
          <TableHeader><TableRow><TableHead>Địa điểm</TableHead><TableHead>Slug</TableHead><TableHead>Bất động sản</TableHead><TableHead>Trạng thái</TableHead><TableHead className="w-[50px]" /></TableRow></TableHeader>
          <TableBody>
            {filteredLocations.map((location) => (
              <TableRow key={location.id}><TableCell className="font-medium"><div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{location.name}</div></TableCell><TableCell><div className="flex items-center gap-2"><Globe className="h-4 w-4" />{location.slug}</div></TableCell><TableCell>{location._count?.properties || 0} bất động sản</TableCell><TableCell><Badge variant={location.isActive ? 'default' : 'outline'}>{location.isActive ? 'Hoạt động' : 'Không hoạt động'}</Badge></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to={`/admin/locations/${location.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Chỉnh sửa</Link></DropdownMenuItem><DropdownMenuItem onClick={() => handleToggleActive(location.id, location.isActive)}>{location.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(location.id)}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredLocations.length === 0 && (
        <AdminEmptyState
          icon={<MapPin className="mx-auto h-12 w-12" />}
          title="Không có địa điểm nào"
          description={searchQuery ? 'Không tìm thấy địa điểm nào phù hợp.' : 'Chưa có địa điểm nào trong hệ thống.'}
          action={<Link to="/admin/locations/new"><Button className="gap-2"><Plus className="h-4 w-4" />Thêm địa điểm đầu tiên</Button></Link>}
        />
      )}
    </AdminPage>
  );
}
