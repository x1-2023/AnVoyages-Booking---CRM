import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  StickyNote,
  UserRound,
  Wallet,
} from 'lucide-react';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { customerService, Customer } from '@/services/customer.service';
import { useToast } from '@/hooks/use-toast';

const currency = (value?: number) => `${(value ?? 0).toLocaleString('vi-VN')}đ`;

const statusLabel: Record<string, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  quoted: 'Đã báo giá',
  confirmed: 'Đã chốt',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  lost: 'Mất lead',
  pending: 'Chờ xử lý',
};

const communicationLabel: Record<string, string> = {
  note: 'Ghi chú nội bộ',
  call: 'Cuộc gọi',
  message: 'Tin nhắn',
};

const directionLabel: Record<string, string> = {
  internal: 'Nội bộ',
  inbound: 'Khách gửi',
  outbound: 'Đã gửi khách',
};

type TimelineItem = {
  id: string;
  kind: 'communication' | 'lead' | 'booking';
  title: string;
  description: string;
  date: string;
  meta?: string;
};

export default function Customers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [query, setQuery] = useState('');
  const [communicationForm, setCommunicationForm] = useState({
    type: 'note',
    direction: 'internal',
    content: '',
  });

  const loadCustomers = useCallback(async () => {
    const data = await customerService.getAll(query || undefined);
    setCustomers(data);
    setSelectedCustomer((current) => {
      if (!current) return data[0] ?? null;
      return data.find((customer) => customer.id === current.id) ?? data[0] ?? null;
    });
  }, [query]);

  useEffect(() => {
    loadCustomers().catch((error) => {
      toast({
        title: 'Không tải được khách hàng',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    });
  }, [loadCustomers, toast]);

  const totals = useMemo(
    () => customers.map((customer) => ({
      ...customer,
      totalSpent: customer.bookings?.reduce((sum, booking) => sum + booking.totalPrice, 0) ?? 0,
    })),
    [customers],
  );

  const selectedTotalSpent = useMemo(
    () => selectedCustomer?.bookings?.reduce((sum, booking) => sum + booking.totalPrice, 0) ?? 0,
    [selectedCustomer],
  );

  const timeline = useMemo<TimelineItem[]>(() => {
    if (!selectedCustomer) return [];

    const communications = selectedCustomer.communications?.map((item) => ({
      id: item.id,
      kind: 'communication' as const,
      title: communicationLabel[item.type] ?? item.type,
      description: item.content,
      date: item.createdAt,
      meta: directionLabel[item.direction] ?? item.direction,
    })) ?? [];

    const leads = selectedCustomer.leads?.map((lead) => ({
      id: lead.id,
      kind: 'lead' as const,
      title: `Lead ${statusLabel[lead.status] ?? lead.status}`,
      description: lead.property?.name ?? lead.notes ?? 'Chưa chọn tour',
      date: lead.createdAt ?? lead.travelDate ?? selectedCustomer.createdAt,
      meta: lead.travelDate ? `Ngày đi ${new Date(lead.travelDate).toLocaleDateString('vi-VN')}` : lead.source,
    })) ?? [];

    const bookings = selectedCustomer.bookings?.map((booking) => ({
      id: booking.id,
      kind: 'booking' as const,
      title: `Booking ${statusLabel[booking.status] ?? booking.status}`,
      description: `${booking.property?.name ?? booking.bookingCode ?? 'Dịch vụ'} - ${currency(booking.totalPrice)}`,
      date: booking.createdAt ?? booking.checkIn ?? selectedCustomer.createdAt,
      meta: booking.checkIn ? `Check-in ${new Date(booking.checkIn).toLocaleDateString('vi-VN')}` : undefined,
    })) ?? [];

    return [...communications, ...leads, ...bookings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [selectedCustomer]);

  const openCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    try {
      setSelectedCustomer(await customerService.getOne(customer.id));
    } catch (error) {
      toast({
        title: 'Không tải được hồ sơ khách',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    }
  };

  const createCommunication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer || !communicationForm.content.trim()) return;

    try {
      await customerService.createCommunication(selectedCustomer.id, {
        type: communicationForm.type,
        direction: communicationForm.direction,
        content: communicationForm.content.trim(),
      });
      const refreshedCustomer = await customerService.getOne(selectedCustomer.id);
      setSelectedCustomer(refreshedCustomer);
      setCustomers((current) => current.map((customer) => (
        customer.id === refreshedCustomer.id ? refreshedCustomer : customer
      )));
      setCommunicationForm({ type: 'note', direction: 'internal', content: '' });
      toast({ title: 'Đã lưu trao đổi với khách' });
    } catch (error) {
      toast({
        title: 'Không lưu được trao đổi',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Khách hàng"
        description="Hồ sơ khách, lịch sử tư vấn, lead và booking trên cùng một timeline."
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm theo tên, SĐT, email..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)]">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Tổng chi tiêu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totals.map((customer) => (
                <TableRow
                  key={customer.id}
                  className={selectedCustomer?.id === customer.id ? 'bg-muted/60' : 'cursor-pointer'}
                  onClick={() => openCustomer(customer)}
                >
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-4 w-4" />
                      {customer.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{customer.phone ?? '-'}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{customer.email ?? '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.source ?? '-'}</TableCell>
                  <TableCell>{customer.bookings?.length ?? 0}</TableCell>
                  <TableCell>{customer.leads?.length ?? 0}</TableCell>
                  <TableCell className="font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Wallet className="h-4 w-4" />
                      {currency(customer.totalSpent)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          {selectedCustomer ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserRound className="h-5 w-5" />
                      {selectedCustomer.name}
                    </CardTitle>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{selectedCustomer.phone ?? 'Chưa có SĐT'}</p>
                      <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{selectedCustomer.email ?? 'Chưa có email'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{selectedCustomer.source ?? 'Không rõ nguồn'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Lead</p>
                    <p className="text-lg font-semibold">{selectedCustomer.leads?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Booking</p>
                    <p className="text-lg font-semibold">{selectedCustomer.bookings?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chi tiêu</p>
                    <p className="text-lg font-semibold">{currency(selectedTotalSpent)}</p>
                  </div>
                </div>

                <form className="space-y-3" onSubmit={createCommunication}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      value={communicationForm.type}
                      onValueChange={(type) => setCommunicationForm((current) => ({
                        ...current,
                        type,
                        direction: type === 'note' ? 'internal' : current.direction,
                      }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Ghi chú nội bộ</SelectItem>
                        <SelectItem value="call">Cuộc gọi</SelectItem>
                        <SelectItem value="message">Tin nhắn</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={communicationForm.direction}
                      onValueChange={(direction) => setCommunicationForm((current) => ({ ...current, direction }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Nội bộ</SelectItem>
                        <SelectItem value="outbound">Đã gửi khách</SelectItem>
                        <SelectItem value="inbound">Khách gửi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Nhập nội dung tư vấn, ghi chú cuộc gọi hoặc tin nhắn..."
                    value={communicationForm.content}
                    onChange={(event) => setCommunicationForm((current) => ({ ...current, content: event.target.value }))}
                  />
                  <Button type="submit" disabled={!communicationForm.content.trim()}>
                    <StickyNote className="mr-2 h-4 w-4" />
                    Lưu vào timeline
                  </Button>
                </form>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Timeline chăm sóc</h2>
                    <Badge variant="outline">{timeline.length} mục</Badge>
                  </div>
                  {timeline.length > 0 ? (
                    <div className="space-y-4">
                      {timeline.map((item) => (
                        <div key={`${item.kind}-${item.id}`} className="flex gap-3">
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            {item.kind === 'communication' ? <MessageSquareText className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{item.title}</p>
                              {item.meta && <Badge variant="secondary">{item.meta}</Badge>}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Chưa có trao đổi, lead hoặc booking cho khách này.
                    </p>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-6 text-sm text-muted-foreground">
              Chọn một khách hàng để xem hồ sơ và timeline chăm sóc.
            </CardContent>
          )}
        </Card>
      </div>

      {customers.length === 0 && (
        <AdminEmptyState
          icon={<UserRound className="mx-auto h-12 w-12" />}
          title="Chưa có khách hàng"
          description="Khách từ form booking hoặc lead mới sẽ xuất hiện tại đây."
        />
      )}
    </AdminPage>
  );
}
