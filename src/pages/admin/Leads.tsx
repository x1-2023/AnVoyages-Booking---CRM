import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, DollarSign, Mail, Phone, Plus, UserRound } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { leadService, Lead } from '@/services/lead.service';
import { propertyService, Property } from '@/services/property.service';

const columns = [
  { id: 'new', title: 'Mới' },
  { id: 'contacted', title: 'Đã liên hệ' },
  { id: 'quoted', title: 'Đã báo giá' },
  { id: 'confirmed', title: 'Đã chốt' },
  { id: 'lost', title: 'Mất lead' },
];

const currency = (value?: number) => `${(value ?? 0).toLocaleString('vi-VN')}đ`;

export default function Leads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    propertyId: '',
    travelDate: '',
    numPeople: 2,
    budget: '',
    source: 'facebook',
    notes: '',
  });

  const loadData = useCallback(async () => {
    const [leadData, propertyData] = await Promise.all([
      leadService.getAll(),
      propertyService.getAll({ isActive: true }),
    ]);
    setLeads(leadData);
    setProperties(propertyData);
  }, []);

  useEffect(() => {
    loadData().catch((error) => {
      toast({
        title: 'Không tải được lead',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    });
  }, [loadData, toast]);

  const grouped = useMemo(
    () => columns.map((column) => ({
      ...column,
      leads: leads.filter((lead) => lead.status === column.id),
    })),
    [leads],
  );

  const updateStatus = async (lead: Lead, status: string) => {
    await leadService.updateStatus(lead.id, status);
    await loadData();
  };

  const createLead = async () => {
    await leadService.create({
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        source: form.source,
      },
      propertyId: form.propertyId || undefined,
      travelDate: form.travelDate || undefined,
      numPeople: Number(form.numPeople),
      budget: form.budget ? Number(form.budget) : undefined,
      source: form.source,
      notes: form.notes || undefined,
    });
    setOpen(false);
    setForm({ name: '', phone: '', email: '', propertyId: '', travelDate: '', numPeople: 2, budget: '', source: 'facebook', notes: '' });
    await loadData();
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Lead pipeline"
        description="Theo dõi khách tiềm năng từ inbox, form website, Zalo, Google và referral."
        actions={(
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Thêm lead</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Thêm lead mới</DialogTitle></DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Tên khách" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                <Input placeholder="Số điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                <Input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                <Input type="date" value={form.travelDate} onChange={(event) => setForm({ ...form, travelDate: event.target.value })} />
                <Select value={form.propertyId || 'none'} onValueChange={(value) => setForm({ ...form, propertyId: value === 'none' ? '' : value })}>
                  <SelectTrigger><SelectValue placeholder="Tour quan tâm" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chưa chọn tour</SelectItem>
                    {properties.map((property) => <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={form.numPeople} onChange={(event) => setForm({ ...form, numPeople: Number(event.target.value) })} />
                <Input placeholder="Ngân sách" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} />
                <Select value={form.source} onValueChange={(source) => setForm({ ...form, source })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="zalo">Zalo</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="web">Website</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea className="md:col-span-2" placeholder="Ghi chú tư vấn" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </div>
              <Button onClick={createLead} disabled={!form.name || !form.phone}>Lưu lead</Button>
            </DialogContent>
          </Dialog>
        )}
      />

      <div className="grid gap-4 xl:grid-cols-5">
        {grouped.map((column) => (
          <div key={column.id} className="rounded-xl border bg-muted/30 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{column.title}</h2>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{column.leads.length}</span>
            </div>
            <div className="space-y-3">
              {column.leads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <p className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4" />{lead.customer?.name ?? 'Khách chưa tên'}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" />{lead.customer?.phone ?? 'Chưa có SĐT'}</p>
                      {lead.customer?.email && (
                        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" />{lead.customer.email}</p>
                      )}
                    </div>
                    <p className="text-sm">{lead.property?.name ?? 'Chưa chọn tour'}</p>
                    {lead.notes && <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{lead.notes}</p>}
                    <div className="grid gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{lead.travelDate ? new Date(lead.travelDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{currency(lead.budget)}</span>
                    </div>
                    <Select value={lead.status} onValueChange={(status) => updateStatus(lead, status)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
