import { useCallback, useEffect, useState } from 'react';
import { Edit, FileText, MoreHorizontal, Plus, Search, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { blogService, BlogPost, BlogStatus } from '@/services/blog.service';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<BlogStatus, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
};

const statusVariants: Record<BlogStatus, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

export default function AdminBlog() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogService.getAdminPosts({
        status,
        q: searchQuery || undefined,
      });
      setPosts(data);
    } catch (error) {
      toast({
        title: 'Không tải được bài viết',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, status, toast]);

  useEffect(() => {
    const timer = window.setTimeout(loadPosts, 200);
    return () => window.clearTimeout(timer);
  }, [loadPosts]);

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Xóa bài viết "${post.title}"?`)) return;

    try {
      await blogService.delete(post.id);
      toast({ title: 'Đã xóa bài viết' });
      loadPosts();
    } catch (error) {
      toast({
        title: 'Không thể xóa bài viết',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Blog"
        description="Viết bài, tối ưu SEO, quản lý trạng thái xuất bản và nội dung truyền thông."
        actions={
          <Button asChild className="gap-2">
            <Link to="/admin/blog/new">
              <Plus className="h-4 w-4" />
              Viết bài mới
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo tiêu đề, mô tả, chuyên mục..."
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-[190px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
          <p className="text-muted-foreground">Đang tải bài viết...</p>
        </div>
      ) : posts.length === 0 ? (
        <AdminEmptyState
          icon={<FileText className="mx-auto h-12 w-12" />}
          title="Chưa có bài viết nào"
          description="Tạo bài viết chuẩn SEO đầu tiên cho website."
          action={
            <Button asChild className="gap-2">
              <Link to="/admin/blog/new">
                <Plus className="h-4 w-4" />
                Viết bài mới
              </Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Chuyên mục</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày xuất bản</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="max-w-xl">
                      <p className="font-medium">{post.title}</p>
                      <p className="truncate text-xs text-muted-foreground">/{post.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>{post.category || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={post.seoTitle && post.seoDescription ? 'default' : 'secondary'}>
                      {post.seoTitle && post.seoDescription ? 'Đủ cơ bản' : 'Thiếu meta'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[post.status]}>{statusLabels[post.status]}</Badge>
                  </TableCell>
                  <TableCell>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {post.status === 'published' && (
                          <DropdownMenuItem asChild>
                            <Link to={`/blog/${post.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Xem ngoài website
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/blog/${post.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(post)}>
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
      )}
    </AdminPage>
  );
}
