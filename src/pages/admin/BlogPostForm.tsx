import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Bold,
  Heading1,
  Heading2,
  Image,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Save,
  Upload,
  Video,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { blogService, BlogPostPayload, BlogStatus } from '@/services/blog.service';
import { useToast } from '@/hooks/use-toast';

const emptyForm: BlogPostPayload = {
  title: '',
  titleVi: '',
  titleEn: '',
  slug: '',
  slugVi: '',
  slugEn: '',
  excerpt: '',
  contentHtml: '<h2>Tiêu đề phần</h2><p>Viết nội dung bài ở đây...</p>',
  coverImage: '',
  category: '',
  tags: [],
  authorName: 'An Voyages',
  status: 'draft',
  featured: false,
  readingMinutes: 1,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  canonicalUrl: '',
  ogImage: '',
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

function youtubeEmbedUrl(value: string) {
  const match =
    value.match(/youtube\.com\/watch\?v=([^&]+)/) ||
    value.match(/youtu\.be\/([^?]+)/) ||
    value.match(/youtube\.com\/embed\/([^?]+)/);

  return match ? `https://www.youtube.com/embed/${match[1]}` : value;
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function BlogPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagsText, setTagsText] = useState('');
  const [form, setForm] = useState<BlogPostPayload>(emptyForm);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const post = await blogService.getAdminPost(id);
        const nextForm: BlogPostPayload = {
          title: post.title,
          titleVi: post.titleVi || post.title,
          titleEn: post.titleEn || '',
          slug: post.slug,
          slugVi: post.slugVi || post.slug,
          slugEn: post.slugEn || '',
          excerpt: post.excerpt || '',
          excerptVi: post.excerptVi || post.excerpt || '',
          excerptEn: post.excerptEn || '',
          contentHtml: post.contentHtml,
          contentHtmlVi: post.contentHtmlVi || post.contentHtml,
          contentHtmlEn: post.contentHtmlEn || '',
          coverImage: post.coverImage || '',
          category: post.category || '',
          categoryVi: post.categoryVi || post.category || '',
          categoryEn: post.categoryEn || '',
          tags: post.tags,
          tagsVi: post.tagsVi || post.tags,
          tagsEn: post.tagsEn || [],
          authorName: post.authorName,
          status: post.status,
          statusVi: post.statusVi || post.status,
          statusEn: post.statusEn || 'draft',
          featured: post.featured,
          readingMinutes: post.readingMinutes,
          seoTitle: post.seoTitle || '',
          seoTitleVi: post.seoTitleVi || post.seoTitle || '',
          seoTitleEn: post.seoTitleEn || '',
          seoDescription: post.seoDescription || '',
          seoDescriptionVi: post.seoDescriptionVi || post.seoDescription || '',
          seoDescriptionEn: post.seoDescriptionEn || '',
          seoKeywords: post.seoKeywords || '',
          seoKeywordsVi: post.seoKeywordsVi || post.seoKeywords || '',
          seoKeywordsEn: post.seoKeywordsEn || '',
          canonicalUrl: post.canonicalUrl || '',
          ogImage: post.ogImage || '',
        };
        setForm(nextForm);
        setTagsText(post.tags.join(', '));
      } catch (error) {
        toast({
          title: 'Không tải được bài viết',
          description: error instanceof Error ? error.message : 'Vui lòng thử lại',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, toast]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== form.contentHtml) {
      editorRef.current.innerHTML = form.contentHtml;
    }
  }, [form.contentHtml]);

  const seoScore = useMemo(() => {
    const checks = [
      Boolean(form.seoTitle && form.seoTitle.length <= 70),
      Boolean(form.seoDescription && form.seoDescription.length >= 120 && form.seoDescription.length <= 160),
      Boolean(form.slug),
      Boolean(form.coverImage || form.ogImage),
      Boolean(form.contentHtml.includes('<h1') || form.contentHtml.includes('<h2')),
    ];

    return checks.filter(Boolean).length;
  }, [form]);

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  };

  const setBlock = (tag: string) => runCommand('formatBlock', tag);

  const syncContent = () => {
    setForm((prev) => ({ ...prev, contentHtml: editorRef.current?.innerHTML || '' }));
  };

  const insertLink = () => {
    const url = window.prompt('Nhập URL liên kết');
    if (!url) return;
    runCommand('createLink', url);
  };

  const insertImage = (url?: string) => {
    const imageUrl = url || window.prompt('Nhập URL ảnh');
    if (!imageUrl) return;
    runCommand('insertHTML', `<figure><img src="${imageUrl}" alt="" /><figcaption>Chú thích ảnh</figcaption></figure>`);
  };

  const insertYoutube = () => {
    const url = window.prompt('Dán link YouTube');
    if (!url) return;
    const embedUrl = youtubeEmbedUrl(url);
    runCommand(
      'insertHTML',
      `<div class="video-embed"><iframe src="${embedUrl}" title="YouTube video" frameborder="0" allowfullscreen></iframe></div>`,
    );
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;

    try {
      setUploading(true);
      const uploaded = await blogService.uploadImage(file);
      insertImage(uploaded.url);
      if (!form.coverImage) {
        setForm((prev) => ({ ...prev, coverImage: uploaded.url, ogImage: uploaded.url }));
      }
      toast({ title: 'Đã upload ảnh' });
    } catch (error) {
      toast({
        title: 'Không upload được ảnh',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const contentHtml = editorRef.current?.innerHTML || form.contentHtml;

    try {
      setSaving(true);
      const payload: BlogPostPayload = {
        ...form,
        contentHtml,
        contentHtmlVi: form.contentHtmlVi || contentHtml,
        slug: form.slug || slugify(form.title),
        slugVi: form.slugVi || slugify(form.titleVi || form.title),
        slugEn: form.slugEn || (form.titleEn ? slugify(form.titleEn) : undefined),
        title: form.titleVi || form.title,
        excerpt: form.excerptVi || form.excerpt,
        category: form.categoryVi || form.category,
        seoTitle: form.seoTitleVi || form.seoTitle,
        seoDescription: form.seoDescriptionVi || form.seoDescription,
        seoKeywords: form.seoKeywordsVi || form.seoKeywords,
        tags: splitTags(tagsText),
        tagsVi: form.tagsVi && form.tagsVi.length > 0 ? form.tagsVi : splitTags(tagsText),
        readingMinutes: Number(form.readingMinutes) || 1,
        canonicalUrl: form.canonicalUrl || undefined,
      };

      if (isEdit && id) {
        await blogService.update(id, payload);
      } else {
        await blogService.create(payload);
      }

      toast({ title: isEdit ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết' });
      navigate('/admin/blog');
    } catch (error) {
      toast({
        title: 'Không lưu được bài viết',
        description: error instanceof Error ? error.message : 'Vui lòng kiểm tra lại dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader title={isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'} description="Đang tải dữ liệu..." />
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
        description="Editor hỗ trợ heading H1-H6, định dạng chữ, ảnh, video YouTube và trường SEO."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/blog">Quay lại danh sách</Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Song ngữ & SEO theo ngôn ngữ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titleVi">Tiêu đề VI</Label>
                <Input id="titleVi" value={form.titleVi || form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value, titleVi: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title EN</Label>
                <Input id="titleEn" value={form.titleEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, titleEn: event.target.value, slugEn: prev.slugEn || slugify(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slugEn">Slug EN</Label>
                <Input id="slugEn" value={form.slugEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, slugEn: slugify(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Status EN</Label>
                <Select value={form.statusEn || 'draft'} onValueChange={(value: BlogStatus) => setForm((prev) => ({ ...prev, statusEn: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerptEn">Excerpt EN</Label>
                <Textarea id="excerptEn" value={form.excerptEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, excerptEn: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentHtmlEn">HTML content EN</Label>
                <Textarea id="contentHtmlEn" value={form.contentHtmlEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, contentHtmlEn: event.target.value }))} rows={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoTitleEn">SEO title EN</Label>
                <Input id="seoTitleEn" value={form.seoTitleEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoTitleEn: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescriptionEn">Meta description EN</Label>
                <Textarea id="seoDescriptionEn" value={form.seoDescriptionEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoDescriptionEn: event.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                      slug: prev.slug || slugify(event.target.value),
                      seoTitle: prev.seoTitle || event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Mô tả ngắn</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                  placeholder="Tóm tắt ngắn hiển thị ở trang danh sách và meta description nếu cần."
                />
              </div>

              <div className="rounded-xl border">
                <div className="flex flex-wrap gap-2 border-b bg-muted/40 p-2">
                  <ToolbarButton label="Bold" onClick={() => runCommand('bold')} icon={<Bold className="h-4 w-4" />} />
                  <ToolbarButton label="Italic" onClick={() => runCommand('italic')} icon={<Italic className="h-4 w-4" />} />
                  <ToolbarButton label="H1" onClick={() => setBlock('h1')} icon={<Heading1 className="h-4 w-4" />} />
                  <ToolbarButton label="H2" onClick={() => setBlock('h2')} icon={<Heading2 className="h-4 w-4" />} />
                  {['h3', 'h4', 'h5', 'h6'].map((tag) => (
                    <Button key={tag} type="button" variant="ghost" size="sm" onClick={() => setBlock(tag)}>
                      {tag.toUpperCase()}
                    </Button>
                  ))}
                  <ToolbarButton label="Bullets" onClick={() => runCommand('insertUnorderedList')} icon={<List className="h-4 w-4" />} />
                  <ToolbarButton label="Numbers" onClick={() => runCommand('insertOrderedList')} icon={<ListOrdered className="h-4 w-4" />} />
                  <ToolbarButton label="Quote" onClick={() => setBlock('blockquote')} icon={<Quote className="h-4 w-4" />} />
                  <ToolbarButton label="Link" onClick={insertLink} icon={<LinkIcon className="h-4 w-4" />} />
                  <ToolbarButton label="Ảnh URL" onClick={() => insertImage()} icon={<Image className="h-4 w-4" />} />
                  <ToolbarButton label="YouTube" onClick={insertYoutube} icon={<Video className="h-4 w-4" />} />
                  <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Đang upload...' : 'Upload ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(event) => handleUpload(event.target.files?.[0])}
                    />
                  </label>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncContent}
                  className="prose prose-sm min-h-[520px] max-w-none p-5 outline-none prose-headings:font-display prose-img:rounded-lg prose-iframe:aspect-video prose-iframe:w-full prose-iframe:rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select value={form.status} onValueChange={(value: BlogStatus) => setForm((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="published">Xuất bản</SelectItem>
                      <SelectItem value="archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Tác giả</Label>
                  <Input id="author" value={form.authorName || ''} onChange={(event) => setForm((prev) => ({ ...prev, authorName: event.target.value }))} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
                />
                Ghim bài nổi bật
              </label>

              <Button type="submit" disabled={saving} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Đang lưu...' : 'Lưu bài viết'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân loại & hình ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Chuyên mục</Label>
                <Input id="category" value={form.category || ''} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Cẩm nang, Lịch trình, Kinh nghiệm..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="Hạ Long, Cát Bà, du thuyền" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Ảnh đại diện</Label>
                <Input id="coverImage" value={form.coverImage || ''} onChange={(event) => setForm((prev) => ({ ...prev, coverImage: event.target.value }))} />
                {form.coverImage && <img src={form.coverImage} alt="Cover" className="aspect-video w-full rounded-lg border object-cover" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                SEO
                <Badge variant={seoScore >= 4 ? 'default' : 'secondary'}>{seoScore}/5</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug URL</Label>
                <Input id="slug" value={form.slug || ''} onChange={(event) => setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO title</Label>
                <Input id="seoTitle" value={form.seoTitle || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))} maxLength={180} />
                <p className="text-xs text-muted-foreground">Nên khoảng 50-70 ký tự.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta description</Label>
                <Textarea id="seoDescription" value={form.seoDescription || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))} maxLength={320} />
                <p className="text-xs text-muted-foreground">Nên khoảng 120-160 ký tự. Hiện tại: {(form.seoDescription || '').length}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO keywords</Label>
                <Input id="seoKeywords" value={form.seoKeywords || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoKeywords: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input id="canonicalUrl" value={form.canonicalUrl || ''} onChange={(event) => setForm((prev) => ({ ...prev, canonicalUrl: event.target.value }))} placeholder="Để trống nếu dùng URL mặc định" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogImage">OG image</Label>
                <Input id="ogImage" value={form.ogImage || ''} onChange={(event) => setForm((prev) => ({ ...prev, ogImage: event.target.value }))} />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminPage>
  );
}

function ToolbarButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} title={label} aria-label={label}>
      {icon}
    </Button>
  );
}
