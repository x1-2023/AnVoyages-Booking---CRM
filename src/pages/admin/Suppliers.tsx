import { useCallback, useEffect, useState } from 'react';
import { Plus, Ship, Phone, Mail, Trash2 } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supplierService, Supplier } from '@/services/supplier.service';
import { useToast } from '@/hooks/use-toast';

export default function Suppliers() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'cruise', contactPerson: '', phone: '', email: '', contractRate: '', notes: '' });

  const loadSuppliers = useCallback(async () => setSuppliers(await supplierService.getAll()), []);

  useEffect(() => {
    loadSuppliers().catch((error) => toast({ title: 'Không tải được NCC', description: error instanceof Error ? error.message : 'Vui lòng thử lại', variant: 'destructive' }));
  }, [loadSuppliers, toast]);

  const createSupplier = async () => {
    await supplierService.create(form);
    setOpen(false);
    setForm({ name: '', type: 'cruise', contactPerson: '', phone: '', email: '', contractRate: '', notes: '' });
    await loadSuppliers();
  };

  const removeSupplier = async (id: string) => {
    if (!confirm('Xóa nhà cung cấp này?')) return;
    await supplierService.delete(id);
    await loadSuppliers();
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Nhà cung cấp"
        description="Quản lý cruise, khách sạn, nhà xe, tour operator và deal giá net."
        actions={(
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Thêm NCC</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm nhà cung cấp</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Tên NCC" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cruise">Cruise</SelectItem>
                    <SelectItem value="hotel">Hotel/Resort</SelectItem>
                    <SelectItem value="transport">Nhà xe</SelectItem>
                    <SelectItem value="tour_operator">Tour operator</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Người liên hệ" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                <Input placeholder="SĐT" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Textarea placeholder="Deal giá / chính sách commission" value={form.contractRate} onChange={(e) => setForm({ ...form, contractRate: e.target.value })} />
                <Textarea placeholder="Ghi chú" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={createSupplier} disabled={!form.name}>Lưu NCC</Button>
            </DialogContent>
          </Dialog>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-semibold"><Ship className="h-4 w-4" />{supplier.name}</h2>
                  <p className="text-sm text-muted-foreground">{supplier.type}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeSupplier(supplier.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-1 text-sm">
                <p>{supplier.contactPerson || 'Chưa có người liên hệ'}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{supplier.phone || '-'}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{supplier.email || '-'}</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Deal giá</p>
                <p className="mt-1 text-muted-foreground">{supplier.contractRate || 'Chưa ghi deal'}</p>
              </div>
              <p className="text-xs text-muted-foreground">{supplier.properties?.length ?? 0} sản phẩm đang liên kết</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
