import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  Check,
  Copy,
  CreditCard,
  Eye,
  ExternalLink,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  X as XIcon,
} from 'lucide-react';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { bookingService, type SepayCheckout } from '@/services/booking.service';

type BookingStatus = 'pending' | 'contacted' | 'quoted' | 'confirmed' | 'deposit' | 'paid' | 'completed' | 'cancelled';
type PaymentStatus = 'unpaid' | 'deposit' | 'paid' | 'refunded';

interface Payment {
  id: string;
  amount: number;
  method: string;
  type: string;
  referenceCode?: string;
  transferContent?: string;
  note?: string;
  createdAt: string;
}

interface Booking {
  id: string;
  bookingCode?: string;
  customerName: string;
  phone: string;
  email?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalCost?: number;
  totalPrice: number;
  profit?: number;
  depositAmount: number;
  depositPercent?: number;
  discountCode?: string;
  paidAmount: number;
  bookingIntent?: string;
  requestedPaymentMethod?: string;
  productOptionId?: string;
  productOptionName?: string;
  productOptionType?: string;
  productOptionPrice?: number;
  productOptionDurationDays?: number;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  transferContent?: string;
  status: BookingStatus;
  note?: string;
  adminNote?: string;
  sepayCheckout?: SepayCheckout;
  location?: { name: string };
  property?: { name: string; type?: string; durationDays?: number };
  productOption?: { name?: string; nameVi?: string; nameEn?: string; optionType?: string; durationDays?: number; basePrice?: number };
  payments?: Payment[];
  createdAt: string;
  updatedAt?: string;
}

type CheckoutAction = 'create' | 'open';

const statusFlow: BookingStatus[] = ['pending', 'contacted', 'quoted', 'confirmed', 'deposit', 'paid', 'completed'];

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Chờ xử lý',
  contacted: 'Đã liên hệ',
  quoted: 'Đã báo giá',
  confirmed: 'Đã xác nhận',
  deposit: 'Đã cọc',
  paid: 'Đã thanh toán',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  deposit: 'Đã cọc',
  paid: 'Đã thanh toán đủ',
  refunded: 'Đã hoàn tiền',
};

const intentLabels: Record<string, string> = {
  consultation: 'Tư vấn trước',
  pay_deposit: 'Muốn đặt cọc',
  pay_full: 'Muốn thanh toán đủ',
};

const methodLabels: Record<string, string> = {
  sepay: 'Sepay',
  bank_transfer: 'Chuyển khoản',
  cash: 'Tiền mặt',
};
const currency = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
const date = (value: string) => new Date(value).toLocaleDateString('vi-VN');
const bookingLabel = (booking: Booking) => booking.bookingCode ?? booking.id.slice(0, 8);

function getBookingProductName(booking: Booking) {
  return booking.property?.name ?? booking.location?.name ?? '-';
}

function getBookingOptionName(booking: Booking) {
  return booking.productOptionName
    ?? booking.productOption?.nameVi
    ?? booking.productOption?.name
    ?? booking.productOption?.nameEn
    ?? '-';
}

function getBookingDurationDays(booking: Booking) {
  return booking.productOptionDurationDays ?? booking.productOption?.durationDays ?? booking.property?.durationDays ?? 0;
}

function getBookingNights(booking: Booking) {
  const diff = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  return Number.isFinite(diff) && diff > 0 ? diff : Math.max(getBookingDurationDays(booking) - 1, 0);
}

function formatBookingSchedule(booking: Booking) {
  const nights = getBookingNights(booking);
  const durationDays = getBookingDurationDays(booking);
  const fixedItinerary = Boolean((booking.property?.type === 'tour' || booking.property?.type === 'cruise') && durationDays > 0);

  if (fixedItinerary) {
    return `${date(booking.checkIn)} · ${durationDays} ngày ${Math.max(durationDays - 1, 0)} đêm`;
  }

  return `${date(booking.checkIn)} - ${date(booking.checkOut)} · ${nights} đêm`;
}
function getCheckoutAmount(booking: Booking) {
  if (booking.bookingIntent === 'pay_deposit' && booking.depositAmount > 0 && booking.paidAmount <= 0) {
    return booking.depositAmount;
  }

  if (booking.paymentStatus === 'deposit') {
    return Math.max(booking.totalPrice - booking.paidAmount, 0);
  }

  return Math.max(booking.totalPrice - booking.paidAmount, 0) || booking.totalPrice;
}

function openSepayCheckout(checkout?: SepayCheckout) {
  if (!checkout?.checkoutUrl) return false;

  const fields = checkout.fields ?? {};
  if (!Object.keys(fields).length) {
    window.open(checkout.checkoutUrl, '_blank', 'noopener,noreferrer');
    return true;
  }

  const form = document.createElement('form');
  form.method = checkout.method?.toUpperCase() === 'GET' ? 'GET' : 'POST';
  form.action = checkout.checkoutUrl;
  form.target = '_blank';

  Object.entries(fields).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
  return true;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAll(filter !== 'all' ? { status: filter } : undefined);
      setBookings(data);
      setSelectedBooking((current) => data.find((booking: Booking) => booking.id === current?.id) ?? null);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tải booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => {
      const query = searchQuery.toLowerCase();

      return (
        booking.customerName.toLowerCase().includes(query) ||
        booking.phone.includes(searchQuery) ||
        booking.bookingCode?.toLowerCase().includes(query) ||
        booking.paymentReference?.toLowerCase().includes(query) ||
        booking.transferContent?.toLowerCase().includes(query) ||
        booking.property?.name.toLowerCase().includes(query)
      );
    }),
    [bookings, searchQuery],
  );

  const updateStatus = async (booking: Booking, status: BookingStatus) => {
    await bookingService.updateStatus(booking.id, status);
    toast({ title: 'Đã cập nhật trạng thái', description: `${booking.bookingCode ?? booking.id.slice(0, 8)}: ${statusLabels[status]}` });
    await loadBookings();
  };

  const updatePayment = async (booking: Booking, target: 'deposit' | 'paid') => {
    const nextPaidAmount = target === 'deposit'
      ? Math.max(booking.paidAmount, booking.depositAmount || Math.round(booking.totalPrice * 0.5))
      : booking.totalPrice;
    const amount = Math.max(nextPaidAmount - booking.paidAmount, 0);

    await bookingService.updatePayment(booking.id, {
      paidAmount: nextPaidAmount,
      amount,
      type: target === 'deposit' ? 'deposit' : 'final_payment',
      method: booking.requestedPaymentMethod === 'sepay' ? 'sepay' : 'bank_transfer',
      referenceCode: booking.paymentReference ?? booking.bookingCode,
      paymentReference: booking.paymentReference ?? booking.bookingCode,
      transferContent: booking.transferContent,
      note: target === 'deposit' ? 'Admin ghi nhận tiền cọc' : 'Admin ghi nhận thanh toán đủ',
    });

    toast({
      title: target === 'deposit' ? 'Đã ghi nhận cọc' : 'Đã ghi nhận thanh toán đủ',
      description: `${currency(amount)} cho ${booking.bookingCode ?? booking.id.slice(0, 8)}`,
    });
    await loadBookings();
  };

  const handleCheckout = async (booking: Booking, action: CheckoutAction) => {
    if (action === 'open' && openSepayCheckout(booking.sepayCheckout)) return;

    try {
      setCheckoutLoadingId(booking.id);
      const updatedBooking = await bookingService.createSepayCheckout(booking.id, {
        phone: booking.phone,
        bookingCode: booking.bookingCode,
      });
      const checkout = updatedBooking.sepayCheckout as SepayCheckout | undefined;

      setBookings((current) => current.map((item) => (item.id === booking.id ? updatedBooking : item)));
      setSelectedBooking((current) => (current?.id === booking.id ? updatedBooking : current));

      if (checkout?.checkoutUrl) {
        openSepayCheckout(checkout);
        toast({
          title: 'Đã tạo checkout Sepay',
          description: `${bookingLabel(updatedBooking)} - ${currency(getCheckoutAmount(updatedBooking))}`,
        });
      } else {
        toast({
          title: checkout?.configured === false ? 'Sepay chưa cấu hình đủ' : 'Chưa có checkout URL',
          description: checkout?.message ?? 'API đã phản hồi nhưng chưa trả URL checkout.',
          variant: checkout?.configured === false ? 'destructive' : 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Không thể tạo checkout Sepay',
        description: error instanceof Error ? error.message : 'Vui lòng kiểm tra cấu hình Sepay hoặc backend.',
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  const copyTransferContent = async (booking: Booking) => {
    const content = booking.transferContent ?? booking.paymentReference ?? booking.bookingCode;
    if (!content) return;

    await navigator.clipboard.writeText(content);
    toast({ title: 'Đã copy nội dung chuyển khoản', description: content });
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Xóa booking này?')) return;
    await bookingService.delete(id);
    await loadBookings();
  };

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader title="Booking" description="Đang tải danh sách booking..." />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader title="Booking" description="Theo dõi lead, báo giá, xác nhận và thanh toán Sepay-ready." />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã, tên, SĐT, tour, nội dung chuyển khoản..."
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <AdminStatsGrid>
        <Metric label="Tổng booking" value={bookings.length} />
        <Metric label="Đang xử lý" value={bookings.filter((booking) => ['pending', 'contacted', 'quoted'].includes(booking.status)).length} />
        <Metric label="Đã cọc" value={bookings.filter((booking) => booking.paymentStatus === 'deposit').length} />
        <Metric label="Đã thanh toán" value={bookings.filter((booking) => booking.paymentStatus === 'paid').length} />
        <Metric label="Đã thu" value={currency(bookings.reduce((sum, booking) => sum + booking.paidAmount, 0))} />
      </AdminStatsGrid>

      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã booking</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sản phẩm / gói</TableHead>
              <TableHead>Lịch trình</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Sepay</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.bookingCode ?? booking.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{booking.customerName}</div>
                    <div className="text-muted-foreground">{booking.phone}</div>
                  </div>
                </TableCell>
                <TableCell><BookingProductSummary booking={booking} /></TableCell>
                <TableCell>{formatBookingSchedule(booking)}</TableCell>
                <TableCell className="font-semibold">{currency(booking.totalPrice)}</TableCell>
                <TableCell>
                  <PaymentBadge booking={booking} />
                </TableCell>
                <TableCell>
                  <SepaySummary
                    booking={booking}
                    compact
                    onCheckout={handleCheckout}
                    checkoutLoading={checkoutLoadingId === booking.id}
                    onCopyTransferContent={copyTransferContent}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={booking.status === 'cancelled' ? 'destructive' : 'outline'}>{statusLabels[booking.status] ?? booking.status}</Badge>
                </TableCell>
                <TableCell>
                  <BookingActions
                    booking={booking}
                    onView={() => setSelectedBooking(booking)}
                    onStatus={updateStatus}
                    onPayment={updatePayment}
                    onCheckout={handleCheckout}
                    checkoutLoading={checkoutLoadingId === booking.id}
                    onDelete={deleteBooking}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="space-y-3 md:hidden">
        {filteredBookings.map((booking) => (
          <BookingMobileCard
            key={booking.id}
            booking={booking}
            onView={() => setSelectedBooking(booking)}
            onStatus={updateStatus}
            onPayment={updatePayment}
            onCheckout={handleCheckout}
            checkoutLoading={checkoutLoadingId === booking.id}
            onCopyTransferContent={copyTransferContent}
            onDelete={deleteBooking}
          />
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <AdminEmptyState icon={<CalendarCheck className="mx-auto h-12 w-12" />} title="Không có booking" description="Chưa có booking phù hợp với bộ lọc hiện tại." />
      )}

      <BookingDetailDialog
        booking={selectedBooking}
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        onStatus={updateStatus}
        onPayment={updatePayment}
        onCheckout={handleCheckout}
        checkoutLoadingId={checkoutLoadingId}
        onCopyTransferContent={copyTransferContent}
      />
    </AdminPage>
  );
}

function BookingProductSummary({ booking }: { booking: Booking }) {
  const optionName = getBookingOptionName(booking);
  const durationDays = getBookingDurationDays(booking);
  const optionType = booking.productOptionType ?? booking.productOption?.optionType;

  return (
    <div className="min-w-[220px] space-y-1 text-sm">
      <div className="font-medium">{getBookingProductName(booking)}</div>
      {optionName !== '-' && (
        <div className="text-xs text-muted-foreground">Gói: {optionName}</div>
      )}
      <div className="text-xs text-muted-foreground">
        {durationDays ? `${durationDays} ngày` : formatBookingSchedule(booking)}
        {optionType ? ` · ${optionType}` : ''}
      </div>
    </div>
  );
}

function BookingMobileCard({
  booking,
  onView,
  onStatus,
  onPayment,
  onCheckout,
  checkoutLoading,
  onCopyTransferContent,
  onDelete,
}: {
  booking: Booking;
  onView: () => void;
  onStatus: (booking: Booking, status: BookingStatus) => void;
  onPayment: (booking: Booking, target: 'deposit' | 'paid') => void;
  onCheckout: (booking: Booking, action: CheckoutAction) => void;
  checkoutLoading: boolean;
  onCopyTransferContent: (booking: Booking) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{bookingLabel(booking)}</p>
              <Badge variant={booking.status === 'cancelled' ? 'destructive' : 'outline'}>{statusLabels[booking.status] ?? booking.status}</Badge>
            </div>
            <p className="mt-1 text-sm font-medium">{booking.customerName}</p>
            <p className="text-sm text-muted-foreground">{booking.phone}</p>
          </div>
          <BookingActions
            booking={booking}
            onView={onView}
            onStatus={onStatus}
            onPayment={onPayment}
            onCheckout={onCheckout}
            checkoutLoading={checkoutLoading}
            onDelete={onDelete}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <SummaryItem label="Sản phẩm" value={getBookingProductName(booking)} />
          <SummaryItem label="Lịch trình" value={formatBookingSchedule(booking)} />
          <SummaryItem label="Gói" value={getBookingOptionName(booking)} />
          <SummaryItem label="Giá bán" value={currency(booking.totalPrice)} />
          <SummaryItem label="Đã thu" value={currency(booking.paidAmount)} />
          <SummaryItem label="Cọc khách chọn" value={`${booking.depositPercent ?? 0}% - ${currency(booking.depositAmount ?? 0)}`} />
          <SummaryItem label="Mã ưu đãi" value={booking.discountCode || '-'} />
        </div>

        <div className="rounded-md border p-3">
          <PaymentBadge booking={booking} />
        </div>

        <SepaySummary
          booking={booking}
          onCheckout={onCheckout}
          checkoutLoading={checkoutLoading}
          onCopyTransferContent={onCopyTransferContent}
        />

        <div className="flex gap-2">
          <Button className="flex-1" size="sm" variant="outline" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />Chi tiết
          </Button>
          {booking.paymentStatus !== 'paid' && (
            <Button className="flex-1" size="sm" onClick={() => onPayment(booking, booking.paymentStatus === 'deposit' ? 'paid' : 'deposit')}>
              <CreditCard className="mr-2 h-4 w-4" />
              {booking.paymentStatus === 'deposit' ? 'Thanh toán đủ' : 'Ghi nhận cọc'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SepaySummary({
  booking,
  compact = false,
  onCheckout,
  checkoutLoading,
  onCopyTransferContent,
}: {
  booking: Booking;
  compact?: boolean;
  onCheckout: (booking: Booking, action: CheckoutAction) => void;
  checkoutLoading: boolean;
  onCopyTransferContent: (booking: Booking) => void;
}) {
  const checkout = booking.sepayCheckout;
  const hasCheckout = Boolean(checkout?.checkoutUrl);
  const checkoutAmount = getCheckoutAmount(booking);

  return (
    <div className={compact ? 'max-w-[260px] space-y-2 text-xs' : 'space-y-3 text-sm'}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={hasCheckout ? 'default' : checkout?.configured === false ? 'destructive' : 'secondary'}>
          {hasCheckout ? 'Checkout sẵn sàng' : checkout?.configured === false ? 'Chưa cấu hình' : 'Chưa có checkout'}
        </Badge>
        <span className="text-muted-foreground">{currency(checkoutAmount)}</span>
      </div>

      <div className="space-y-1">
        <div className="font-medium">{booking.paymentReference ?? booking.bookingCode ?? '-'}</div>
        <div className="break-words text-muted-foreground">{booking.transferContent ?? '-'}</div>
        {checkout?.message && <div className="text-muted-foreground">{checkout.message}</div>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={hasCheckout ? 'outline' : 'default'} disabled={checkoutLoading} onClick={() => onCheckout(booking, hasCheckout ? 'open' : 'create')}>
          {hasCheckout ? <ExternalLink className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {checkoutLoading ? 'Đang tạo...' : hasCheckout ? 'Mở checkout' : 'Tạo checkout'}
        </Button>
        {(booking.transferContent || booking.paymentReference || booking.bookingCode) && (
          <Button size="sm" variant="outline" onClick={() => onCopyTransferContent(booking)}>
            <Copy className="mr-2 h-4 w-4" />Copy
          </Button>
        )}
      </div>
    </div>
  );
}

function BookingActions({
  booking,
  onView,
  onStatus,
  onPayment,
  onCheckout,
  checkoutLoading,
  onDelete,
}: {
  booking: Booking;
  onView: () => void;
  onStatus: (booking: Booking, status: BookingStatus) => void;
  onPayment: (booking: Booking, target: 'deposit' | 'paid') => void;
  onCheckout: (booking: Booking, action: CheckoutAction) => void;
  checkoutLoading: boolean;
  onDelete: (id: string) => void;
}) {
  const hasCheckout = Boolean(booking.sepayCheckout?.checkoutUrl);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />Chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem disabled={checkoutLoading} onClick={() => onCheckout(booking, hasCheckout ? 'open' : 'create')}>
          {hasCheckout ? <ExternalLink className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {hasCheckout ? 'Mở checkout Sepay' : 'Tạo checkout Sepay'}
        </DropdownMenuItem>
        {booking.status === 'pending' && (
          <DropdownMenuItem onClick={() => onStatus(booking, 'contacted')}>
            <Check className="mr-2 h-4 w-4" />Đã liên hệ
          </DropdownMenuItem>
        )}
        {['pending', 'contacted'].includes(booking.status) && (
          <DropdownMenuItem onClick={() => onStatus(booking, 'quoted')}>
            <Check className="mr-2 h-4 w-4" />Đã báo giá
          </DropdownMenuItem>
        )}
        {['pending', 'contacted', 'quoted'].includes(booking.status) && (
          <DropdownMenuItem onClick={() => onStatus(booking, 'confirmed')}>
            <Check className="mr-2 h-4 w-4" />Xác nhận
          </DropdownMenuItem>
        )}
        {booking.paymentStatus !== 'deposit' && booking.paymentStatus !== 'paid' && (
          <DropdownMenuItem onClick={() => onPayment(booking, 'deposit')}>
            <CreditCard className="mr-2 h-4 w-4" />Ghi nhận cọc
          </DropdownMenuItem>
        )}
        {booking.paymentStatus !== 'paid' && (
          <DropdownMenuItem onClick={() => onPayment(booking, 'paid')}>
            <CreditCard className="mr-2 h-4 w-4" />Thanh toán đủ
          </DropdownMenuItem>
        )}
        {['confirmed', 'deposit', 'paid'].includes(booking.status) && (
          <DropdownMenuItem onClick={() => onStatus(booking, 'completed')}>
            <Check className="mr-2 h-4 w-4" />Hoàn thành
          </DropdownMenuItem>
        )}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <DropdownMenuItem onClick={() => onStatus(booking, 'cancelled')}>
            <XIcon className="mr-2 h-4 w-4" />Hủy
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(booking.id)}>
          <Trash2 className="mr-2 h-4 w-4" />Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
  onStatus,
  onPayment,
  onCheckout,
  checkoutLoadingId,
  onCopyTransferContent,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatus: (booking: Booking, status: BookingStatus) => void;
  onPayment: (booking: Booking, target: 'deposit' | 'paid') => void;
  onCheckout: (booking: Booking, action: CheckoutAction) => void;
  checkoutLoadingId: string | null;
  onCopyTransferContent: (booking: Booking) => void;
}) {
  if (!booking) return null;

  const progress = booking.totalPrice > 0 ? Math.min(Math.round((booking.paidAmount / booking.totalPrice) * 100), 100) : 0;
  const remaining = Math.max(booking.totalPrice - booking.paidAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{booking.bookingCode ?? booking.id.slice(0, 8)} - {booking.customerName}</DialogTitle>
          <DialogDescription>
            {getBookingProductName(booking)} | {formatBookingSchedule(booking)} | {booking.guests} khách
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Tiến trình booking</p>
                    <p className="text-lg font-semibold">{statusLabels[booking.status]}</p>
                  </div>
                  <Badge variant={booking.status === 'cancelled' ? 'destructive' : 'outline'}>{statusLabels[booking.status]}</Badge>
                </div>
                <Timeline booking={booking} />
                <div className="flex flex-wrap gap-2">
                  {booking.status === 'pending' && <Button size="sm" onClick={() => onStatus(booking, 'contacted')}>Đã liên hệ</Button>}
                  {['pending', 'contacted'].includes(booking.status) && <Button size="sm" variant="outline" onClick={() => onStatus(booking, 'quoted')}>Đã báo giá</Button>}
                  {['pending', 'contacted', 'quoted'].includes(booking.status) && <Button size="sm" variant="outline" onClick={() => onStatus(booking, 'confirmed')}>Xác nhận</Button>}
                  {['confirmed', 'deposit', 'paid'].includes(booking.status) && <Button size="sm" variant="outline" onClick={() => onStatus(booking, 'completed')}>Hoàn thành</Button>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lịch sử thanh toán</p>
                  <p className="text-lg font-semibold">{booking.payments?.length ?? 0} giao dịch</p>
                </div>
                <Separator />
                {booking.payments?.length ? (
                  <div className="space-y-3">
                    {booking.payments.map((payment) => (
                      <div key={payment.id} className="rounded-md border p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{currency(payment.amount)}</span>
                          <span className="text-xs text-muted-foreground">{date(payment.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          {payment.type} | {methodLabels[payment.method] ?? payment.method}
                        </div>
                        {(payment.referenceCode || payment.transferContent) && (
                          <div className="mt-2 rounded bg-muted px-2 py-1 text-xs">
                            {payment.referenceCode ?? '-'} | {payment.transferContent ?? '-'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có giao dịch nào được ghi nhận.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment summary</p>
                  <p className="text-2xl font-bold">{currency(booking.paidAmount)} / {currency(booking.totalPrice)}</p>
                </div>
                <Progress value={progress} />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <SummaryItem label="Còn lại" value={currency(remaining)} />
                  <SummaryItem label="Cọc khách chọn" value={`${booking.depositPercent ?? 0}% - ${currency(booking.depositAmount ?? 0)}`} />
                  <SummaryItem label="Trạng thái tiền" value={paymentLabels[booking.paymentStatus ?? 'unpaid']} />
                  <SummaryItem label="Intent" value={intentLabels[booking.bookingIntent ?? 'consultation']} />
                  <SummaryItem label="Mã ưu đãi" value={booking.discountCode || '-'} />
                </div>
                <div className="flex gap-2">
                  {booking.paymentStatus !== 'deposit' && booking.paymentStatus !== 'paid' && (
                    <Button className="flex-1" size="sm" onClick={() => onPayment(booking, 'deposit')}>Ghi nhận cọc</Button>
                  )}
                  {booking.paymentStatus !== 'paid' && (
                    <Button className="flex-1" size="sm" variant="outline" onClick={() => onPayment(booking, 'paid')}>Thanh toán đủ</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sepay checkout</p>
                  <p className="text-lg font-semibold">{methodLabels[booking.requestedPaymentMethod ?? 'bank_transfer'] ?? 'Chuyển khoản'}</p>
                </div>
                <SepaySummary
                  booking={booking}
                  onCheckout={onCheckout}
                  checkoutLoading={checkoutLoadingId === booking.id}
                  onCopyTransferContent={onCopyTransferContent}
                />
                <Separator />
                <ReadonlyField label="Payment reference" value={booking.paymentReference ?? booking.bookingCode ?? '-'} />
                <ReadonlyField label="Nội dung chuyển khoản" value={booking.transferContent ?? '-'} />
                <ReadonlyField label="Mã ưu đãi khách nhập" value={booking.discountCode || '-'} />
                <ReadonlyField label="SĐT" value={booking.phone} />
                {booking.note && <ReadonlyField label="Ghi chú khách" value={booking.note} />}
                {booking.adminNote && <ReadonlyField label="Ghi chú admin" value={booking.adminNote} />}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Timeline({ booking }: { booking: Booking }) {
  if (booking.status === 'cancelled') {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        Booking đã hủy.
      </div>
    );
  }

  const currentIndex = statusFlow.indexOf(booking.status);

  return (
    <div className="grid gap-2 md:grid-cols-7">
      {statusFlow.map((status, index) => {
        const active = index <= currentIndex;

        return (
          <div key={status} className={`rounded-md border p-2 text-xs ${active ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
            <div className="font-medium">{statusLabels[status]}</div>
          </div>
        );
      })}
    </div>
  );
}

function PaymentBadge({ booking }: { booking: Booking }) {
  const paymentStatus = booking.paymentStatus ?? 'unpaid';

  return (
    <div className="space-y-1">
      <Badge variant={paymentStatus === 'paid' ? 'default' : 'secondary'}>{paymentLabels[paymentStatus]}</Badge>
      <p className="text-xs text-muted-foreground">{currency(booking.paidAmount)} đã thu</p>
      {(booking.depositPercent ?? 0) > 0 && (
        <p className="text-xs text-muted-foreground">
          Cọc chọn {booking.depositPercent}% ({currency(booking.depositAmount ?? 0)})
        </p>
      )}
      {booking.discountCode && (
        <p className="text-xs font-medium text-primary">Mã: {booking.discountCode}</p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{value}</div>
    </div>
  );
}
