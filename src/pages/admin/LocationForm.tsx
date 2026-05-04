import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateLocationDto, locationService } from '@/services/location.service';
import { useToast } from '@/hooks/use-toast';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyForm: CreateLocationDto = {
  name: '',
  nameVi: '',
  nameEn: '',
  slug: '',
  description: '',
  descriptionVi: '',
  descriptionEn: '',
  imageUrl: '',
  seoTitle: '',
  seoTitleVi: '',
  seoTitleEn: '',
  seoDescription: '',
  seoDescriptionVi: '',
  seoDescriptionEn: '',
  isActive: true,
};

export default function LocationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateLocationDto>(emptyForm);

  useEffect(() => {
    if (!id) return;
    locationService
      .getById(id)
      .then((location) => {
        setForm({
          name: location.name,
          nameVi: location.nameVi || location.name,
          nameEn: location.nameEn || '',
          slug: location.slug,
          description: location.description || '',
          descriptionVi: location.descriptionVi || location.description || '',
          descriptionEn: location.descriptionEn || '',
          imageUrl: location.imageUrl || '',
          seoTitle: location.seoTitle || '',
          seoTitleVi: location.seoTitleVi || location.seoTitle || '',
          seoTitleEn: location.seoTitleEn || '',
          seoDescription: location.seoDescription || '',
          seoDescriptionVi: location.seoDescriptionVi || location.seoDescription || '',
          seoDescriptionEn: location.seoDescriptionEn || '',
          isActive: location.isActive,
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Không thể tải địa điểm';
        toast({ title: 'Lỗi', description: message, variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        name: form.nameVi || form.name,
        description: form.descriptionVi || form.description,
        seoTitle: form.seoTitleVi || form.seoTitle,
        seoDescription: form.seoDescriptionVi || form.seoDescription,
        slug: form.slug || slugify(form.nameVi || form.name),
      };
      if (isEdit && id) await locationService.update(id, payload);
      else await locationService.create(payload);
      toast({ title: 'Thành công', description: isEdit ? 'Đã cập nhật địa điểm' : 'Đã tạo địa điểm' });
      navigate('/admin/locations');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu địa điểm';
      toast({ title: 'Lỗi', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader title={isEdit ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm'} description="Quản lý nội dung địa điểm hiển thị trên hệ thống." />
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={isEdit ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm'}
        description="Quản lý nội dung địa điểm, bản dịch và meta SEO."
        actions={<Link to="/admin/locations"><Button variant="outline">Quay lại danh sách</Button></Link>}
      />
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin địa điểm</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên địa điểm (VI)" id="nameVi" value={form.nameVi || form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value, nameVi: value, slug: prev.slug || slugify(value) }))} required />
                <Field label="Tên địa điểm (EN)" id="nameEn" value={form.nameEn || ''} onChange={(value) => setForm((prev) => ({ ...prev, nameEn: value }))} />
              </div>

              <Field label="Slug" id="slug" value={form.slug} onChange={(value) => setForm((prev) => ({ ...prev, slug: slugify(value) }))} required />
              <Field label="Ảnh đại diện URL" id="imageUrl" value={form.imageUrl || ''} onChange={(value) => setForm((prev) => ({ ...prev, imageUrl: value }))} placeholder="https://example.com/image.jpg" />

              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Mô tả (VI)" id="descriptionVi" value={form.descriptionVi || form.description || ''} onChange={(value) => setForm((prev) => ({ ...prev, description: value, descriptionVi: value }))} />
                <TextField label="Mô tả (EN)" id="descriptionEn" value={form.descriptionEn || ''} onChange={(value) => setForm((prev) => ({ ...prev, descriptionEn: value }))} />
                <Field label="SEO title (VI)" id="seoTitleVi" value={form.seoTitleVi || form.seoTitle || ''} onChange={(value) => setForm((prev) => ({ ...prev, seoTitle: value, seoTitleVi: value }))} />
                <Field label="SEO title (EN)" id="seoTitleEn" value={form.seoTitleEn || ''} onChange={(value) => setForm((prev) => ({ ...prev, seoTitleEn: value }))} />
                <TextField label="SEO description (VI)" id="seoDescriptionVi" value={form.seoDescriptionVi || form.seoDescription || ''} onChange={(value) => setForm((prev) => ({ ...prev, seoDescription: value, seoDescriptionVi: value }))} />
                <TextField label="SEO description (EN)" id="seoDescriptionEn" value={form.seoDescriptionEn || ''} onChange={(value) => setForm((prev) => ({ ...prev, seoDescriptionEn: value }))} />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.isActive ?? true} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
                Kích hoạt địa điểm
              </label>

              <Button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo địa điểm'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}

function Field({ id, label, value, onChange, placeholder, required }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} />
    </div>
  );
}

function TextField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
