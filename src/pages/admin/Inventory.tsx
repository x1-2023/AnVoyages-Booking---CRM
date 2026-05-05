import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { CalendarDays, Check, Lock, RefreshCw, Save, Search } from 'lucide-react';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { InventoryCalendar, InventoryCalendarDay, InventoryCalendarOption, Property, propertyService } from '@/services/property.service';

const formatDate = (value: string) => format(parseISO(value), 'dd/MM');
const today = () => format(new Date(), 'yyyy-MM-dd');
const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

function getOptionName(option: InventoryCalendarOption) {
  return option.nameVi || option.name || option.nameEn || 'Lựa chọn';
}

function getStockTone(day: InventoryCalendarDay) {
  if (day.closed) return 'border-destructive/30 bg-destructive/5 text-destructive';
  if (day.availableUnits <= 0) return 'border-orange-200 bg-orange-50 text-orange-700';
  if (day.availableUnits <= 2) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export default function AdminInventory() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [days, setDays] = useState(14);
  const [calendar, setCalendar] = useState<InventoryCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadProperties = useCallback(async () => {
    const data = await propertyService.getAll({ isActive: true });
    setProperties(data);
    setSelectedPropertyId((current) => current || data[0]?.id || '');
  }, []);

  const loadCalendar = useCallback(async () => {
    if (!selectedPropertyId) return;

    try {
      setLoading(true);
      const data = await propertyService.getInventory(selectedPropertyId, { startDate, days });
      setCalendar(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(error, 'Không thể tải lịch tồn kho'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [days, selectedPropertyId, startDate, toast]);

  useEffect(() => {
    loadProperties().catch((error) => {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(error, 'Không thể tải danh sách sản phẩm'),
        variant: 'destructive',
      });
      setLoading(false);
    });
  }, [loadProperties, toast]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return calendar?.options || [];

    return (calendar?.options || []).filter((option) =>
      getOptionName(option).toLowerCase().includes(query) ||
      option.optionType?.toLowerCase().includes(query),
    );
  }, [calendar, searchQuery]);

  const summary = useMemo(() => {
    const options = calendar?.options || [];
    const daysFlat = options.flatMap((option) => option.dates);
    return {
      options: options.length,
      closed: daysFlat.filter((day) => day.closed).length,
      soldOut: daysFlat.filter((day) => !day.closed && day.availableUnits <= 0).length,
      overrides: daysFlat.filter((day) => day.isOverride).length,
    };
  }, [calendar]);

  const handleSaveDay = async (option: InventoryCalendarOption, day: InventoryCalendarDay, patch: Partial<InventoryCalendarDay>) => {
    const next = {
      ...day,
      ...patch,
    };
    const key = `${option.id}-${day.date}`;

    try {
      setSavingKey(key);
      await propertyService.updateOptionInventory(option.id!, {
        date: next.date,
        totalUnits: Math.max(Number(next.totalUnits) || 0, 0),
        closed: next.closed,
        note: next.note,
      });
      toast({
        title: 'Đã cập nhật tồn kho',
        description: `${getOptionName(option)} - ${formatDate(day.date)}`,
      });
      await loadCalendar();
    } catch (error) {
      toast({
        title: 'Không thể cập nhật tồn kho',
        description: getErrorMessage(error, 'Vui lòng thử lại'),
        variant: 'destructive',
      });
    } finally {
      setSavingKey('');
    }
  };

  const handleResetDay = async (option: InventoryCalendarOption, day: InventoryCalendarDay) => {
    const key = `${option.id}-${day.date}`;

    try {
      setSavingKey(key);
      await propertyService.deleteOptionInventory(option.id!, day.date);
      toast({
        title: 'Đã đưa về tồn mặc định',
        description: `${getOptionName(option)} - ${formatDate(day.date)}`,
      });
      await loadCalendar();
    } catch (error) {
      toast({
        title: 'Không thể reset tồn kho',
        description: getErrorMessage(error, 'Vui lòng thử lại'),
        variant: 'destructive',
      });
    } finally {
      setSavingKey('');
    }
  };

  const shiftDays = (amount: number) => {
    setStartDate(format(addDays(parseISO(startDate), amount), 'yyyy-MM-dd'));
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Lịch tồn kho"
        description="Quản lý số phòng, cabin, xe còn bán theo từng ngày. Booking public sẽ bị chặn nếu không đủ tồn."
        actions={
          <Button variant="outline" className="gap-2" onClick={loadCalendar} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1.4fr_180px_160px_1fr_auto]">
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.nameVi || property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày</SelectItem>
              <SelectItem value="14">14 ngày</SelectItem>
              <SelectItem value="30">30 ngày</SelectItem>
              <SelectItem value="60">60 ngày</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm hạng phòng/cabin..." />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => shiftDays(-days)}>Trước</Button>
            <Button type="button" variant="outline" onClick={() => shiftDays(days)}>Sau</Button>
          </div>
        </CardContent>
      </Card>

      <AdminStatsGrid>
        <Metric label="Hạng đang bán" value={summary.options} />
        <Metric label="Ngày đóng bán" value={summary.closed} />
        <Metric label="Ngày hết chỗ" value={summary.soldOut} />
        <Metric label="Override thủ công" value={summary.overrides} />
      </AdminStatsGrid>

      {loading ? (
        <Card>
          <CardContent className="flex min-h-64 items-center justify-center text-muted-foreground">
            Đang tải lịch tồn kho...
          </CardContent>
        </Card>
      ) : filteredOptions.length === 0 ? (
        <AdminEmptyState
          icon={<CalendarDays className="mx-auto h-12 w-12" />}
          title="Chưa có hạng phòng/cabin"
          description="Hãy thêm lựa chọn trong trang sản phẩm và nhập số lượng bán để quản lý tồn kho."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-[260px] bg-card">Hạng / lựa chọn</TableHead>
                  {filteredOptions[0]?.dates.map((day) => (
                    <TableHead key={day.date} className="min-w-[156px] text-center">
                      {formatDate(day.date)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOptions.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell className="sticky left-0 z-10 bg-card align-top">
                      <div className="space-y-2">
                        <div className="font-semibold">{getOptionName(option)}</div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">{option.optionType}</Badge>
                          <span>Mặc định: {option.defaultUnits || 'không giới hạn'}</span>
                          {option.maxGuests ? <span>{option.maxGuests} khách/đơn vị</span> : null}
                        </div>
                      </div>
                    </TableCell>
                    {option.dates.map((day) => {
                      const key = `${option.id}-${day.date}`;
                      const isSaving = savingKey === key;
                      return (
                        <TableCell key={day.date} className="align-top">
                          <div className={`space-y-2 rounded-xl border p-3 ${getStockTone(day)}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold">
                                {day.closed ? 'Đóng bán' : `${day.availableUnits} còn`}
                              </span>
                              {day.isOverride ? <Badge variant="outline">Manual</Badge> : null}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>Đã giữ: {day.bookedUnits}</div>
                              <div>Tổng: {day.totalUnits}</div>
                            </div>
                            <Input
                              type="number"
                              min={0}
                              defaultValue={day.totalUnits}
                              className="h-9 bg-background text-center"
                              onBlur={(event) => {
                                const nextTotal = Number(event.target.value);
                                if (nextTotal !== day.totalUnits) {
                                  handleSaveDay(option, day, { totalUnits: nextTotal });
                                }
                              }}
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={day.closed ? 'default' : 'outline'}
                                disabled={isSaving}
                                onClick={() => handleSaveDay(option, day, { closed: !day.closed })}
                              >
                                {day.closed ? <Check className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                                {day.closed ? 'Mở' : 'Đóng'}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isSaving}
                                onClick={() => handleSaveDay(option, day, { totalUnits: day.totalUnits })}
                              >
                                <Save className="mr-1 h-3 w-3" />
                                Lưu
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={isSaving || !day.isOverride}
                                onClick={() => handleResetDay(option, day)}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </AdminPage>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
