import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, differenceInCalendarDays, format, isBefore, setDate, startOfDay } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import { Calendar as CalendarIcon, Check, ChevronDown, Minus, Plus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onChange: (range: { from?: Date; to?: Date }) => void;
  selectionMode?: 'range' | 'start';
  fixedNights?: number;
  fixedDays?: number;
  language?: string;
  label?: string;
  fromLabel?: string;
  toLabel?: string;
  placeholder?: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

type PickerMode = 'calendar' | 'flexible';
type FlexibleDuration = 'weekend' | 'week' | 'month' | 'other';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}

function nextWeekday(from: Date, weekday: number) {
  const current = from.getDay();
  const delta = (weekday - current + 7) % 7 || 7;
  return addDays(from, delta);
}

function monthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

export default function DateRangePicker({
  from,
  to,
  onChange,
  selectionMode = 'range',
  fixedNights = 1,
  fixedDays,
  language,
  label,
  fromLabel,
  toLabel,
  placeholder,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>('calendar');
  const [flexibleDuration, setFlexibleDuration] = useState<FlexibleDuration>('weekend');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const isStartOnly = selectionMode === 'start';
  const isVi = language?.startsWith('vi');
  const locale = isVi ? vi : enUS;
  const today = useMemo(() => startOfDay(new Date()), []);
  const displayedFixedDays = Math.max(fixedDays || fixedNights + 1, 1);
  const displayedFixedNights = Math.max(displayedFixedDays - 1, 0);

  const nights = from && to ? Math.max(differenceInCalendarDays(to, from), 0) : 0;
  const displayText = from
    ? isStartOnly
      ? format(from, 'dd/MM/yyyy')
      : to
      ? `${format(from, 'dd/MM/yyyy')} - ${format(to, 'dd/MM/yyyy')}`
      : `${format(from, 'dd/MM/yyyy')} - ...`
    : placeholder || (isStartOnly
      ? isVi ? 'Chọn ngày đi' : 'Select start date'
      : isVi ? 'Chọn ngày đi và ngày về' : 'Select travel dates');

  const quickRanges = useMemo(() => {
    const tomorrow = addDays(today, 1);
    const friday = nextWeekday(today, 5);
    const nextFriday = nextWeekday(addDays(today, 7), 5);

    return [
      {
        label: isVi ? '2 ngày 1 đêm' : '2 days, 1 night',
        range: { from: tomorrow, to: addDays(tomorrow, 1) },
      },
      {
        label: isVi ? '3 ngày 2 đêm' : '3 days, 2 nights',
        range: { from: tomorrow, to: addDays(tomorrow, 2) },
      },
      {
        label: isVi ? 'Cuối tuần này' : 'This weekend',
        range: { from: friday, to: addDays(friday, 2) },
      },
      {
        label: isVi ? 'Cuối tuần linh hoạt' : 'Flexible weekend',
        range: { from: nextFriday, to: addDays(nextFriday, 2) },
      },
    ];
  }, [isVi, today]);

  const flexibleMonths = useMemo(
    () => Array.from({ length: 4 }, (_, index) => setDate(addDays(today, index * 31), 1)),
    [today],
  );

  const flexibleDurations = [
    { value: 'weekend' as const, label: isVi ? 'Một cuối tuần' : 'A weekend', nights: 2 },
    { value: 'week' as const, label: isVi ? 'Một tuần' : 'A week', nights: 7 },
    { value: 'month' as const, label: isVi ? 'Một tháng' : 'A month', nights: 30 },
    { value: 'other' as const, label: isVi ? 'Linh hoạt khác' : 'Other', nights: 3 },
  ];

  const activeFlexibleDuration = flexibleDurations.find((item) => item.value === flexibleDuration) || flexibleDurations[0];
  const canApplyFlexible = selectedMonths.length > 0;

  const rangeSummary = from && to
    ? `${format(from, 'MMM d', { locale })} - ${format(to, 'MMM d', { locale })} (${nights} ${isVi ? 'đêm' : `night${nights > 1 ? 's' : ''}`})`
    : isVi
      ? 'Chưa chọn đủ ngày'
      : 'Range incomplete';

  const handleSelect = (range?: DateRange) => {
    const nextFrom = range?.from;
    const nextTo = range?.to;

    if (nextFrom && nextTo && isBefore(nextTo, nextFrom)) {
      onChange({ from: nextTo, to: nextFrom });
      return;
    }

    onChange({ from: nextFrom, to: nextTo });
  };

  const handleStartSelect = (date?: Date) => {
    if (!date) {
      onChange({});
      return;
    }

    onChange({ from: date, to: addDays(date, Math.max(displayedFixedDays - 1, 1)) });
  };

  const setStayLength = (length: number) => {
    const start = from || addDays(today, 1);
    onChange({ from: start, to: addDays(start, length) });
  };

  const toggleMonth = (key: string) => {
    setSelectedMonths((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      if (current.length >= 3) {
        return [...current.slice(1), key];
      }
      return [...current, key];
    });
  };

  const applyFlexible = () => {
    if (!canApplyFlexible) return;

    const selectedMonth = flexibleMonths.find((month) => monthKey(month) === selectedMonths[0]) || flexibleMonths[0];
    const startCandidate = nextWeekday(selectedMonth, flexibleDuration === 'weekend' ? 5 : 1);
    const start = isBefore(startCandidate, today) ? nextWeekday(today, flexibleDuration === 'weekend' ? 5 : 1) : startCandidate;
    onChange({ from: start, to: addDays(start, activeFlexibleDuration.nights) });
    setOpen(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {label}
        </label>
      )}

      {!isStartOnly && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickRanges.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-10 min-w-[118px] shrink-0 rounded-full border-primary/25 bg-background px-3 text-center text-[11px] font-semibold leading-tight text-primary shadow-sm hover:bg-primary/10 lg:text-xs"
              onClick={() => onChange(preset.range)}
            >
              <span className="block w-full whitespace-nowrap">{preset.label}</span>
            </Button>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className={cn(
          'h-12 w-full justify-between rounded-xl border-border bg-background/80 px-3 text-left font-normal shadow-sm transition-shadow hover:bg-background hover:shadow-md',
          !from && 'text-muted-foreground',
        )}
        onClick={() => setOpen(true)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{displayText}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-60 transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <button type="button" className="absolute inset-0 cursor-default bg-black/20" aria-label="Close date picker" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'fixed inset-x-3 bottom-3 top-16 flex flex-col overflow-hidden rounded-[28px] border bg-background p-0 shadow-2xl',
              'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100vh-48px)] sm:w-[min(900px,calc(100vw-48px))] sm:-translate-x-1/2 sm:-translate-y-1/2',
            )}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative shrink-0 border-b bg-background">
              <div className={cn('grid h-16 px-6 pr-14', isStartOnly ? 'grid-cols-1' : 'grid-cols-2')}>
                <button
                  type="button"
                  className={cn(
                    'border-b-2 text-sm font-semibold transition-colors',
                    mode === 'calendar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => setMode('calendar')}
                >
                  {isStartOnly ? (isVi ? 'Chọn ngày đi' : 'Select start date') : isVi ? 'Lịch' : 'Calendar'}
                </button>
                {!isStartOnly && (
                  <button
                    type="button"
                    className={cn(
                      'border-b-2 text-sm font-semibold transition-colors',
                      mode === 'flexible' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setMode('flexible')}
                  >
                    {isVi ? 'Linh hoạt' : "I'm flexible"}
                  </button>
                )}
              </div>
              <Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3 rounded-full" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-background sm:flex-none">
              {mode === 'calendar' || isStartOnly ? (
                <div className="px-3 py-4 sm:px-6 sm:py-5">
                  {isStartOnly ? (
                    <Calendar
                      mode="single"
                      selected={from}
                      onSelect={handleStartSelect}
                      numberOfMonths={isMobile ? 2 : 2}
                      disabled={{ before: today }}
                      locale={locale}
                      weekStartsOn={1}
                      initialFocus
                      className="p-0"
                    />
                  ) : (
                    <Calendar
                      mode="range"
                      selected={{ from, to }}
                      onSelect={handleSelect}
                      numberOfMonths={isMobile ? 2 : 2}
                      disabled={{ before: today }}
                      locale={locale}
                      weekStartsOn={1}
                      initialFocus
                      className="p-0"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-8 px-6 py-6">
                  <section>
                    <h3 className="text-lg font-bold text-foreground">
                      {isVi ? 'Bạn muốn đi trong bao lâu?' : 'How long do you want to stay?'}
                    </h3>
                    <div className="mt-4 grid gap-3">
                      {flexibleDurations.map((item) => {
                        const selected = flexibleDuration === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border p-3 text-left transition-all',
                              selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-transparent hover:bg-muted/60',
                            )}
                            onClick={() => setFlexibleDuration(item.value)}
                          >
                            <span
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                                selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50',
                              )}
                            >
                              {selected && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                              <span className="block text-xs text-muted-foreground">
                                {item.nights} {isVi ? 'đêm' : `night${item.nights > 1 ? 's' : ''}`}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-foreground">
                      {isVi ? 'Bạn muốn đi khi nào?' : 'When do you want to go?'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isVi ? 'Chọn tối đa 3 tháng' : 'Select up to 3 months'}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {flexibleMonths.map((month) => {
                        const key = monthKey(month);
                        const selected = selectedMonths.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            className={cn(
                              'relative rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md',
                              selected ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/50',
                            )}
                            onClick={() => toggleMonth(key)}
                          >
                            <CalendarIcon className={cn('mx-auto h-5 w-5', selected ? 'text-primary' : 'text-foreground')} />
                            <div className="mt-3 text-sm font-semibold text-foreground">{format(month, 'MMM', { locale })}</div>
                            <div className="text-sm text-muted-foreground">{format(month, 'yyyy')}</div>
                            {selected && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t bg-background/95 p-4 shadow-[0_-12px_24px_rgba(15,23,42,0.04)] backdrop-blur">
              {!isStartOnly && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <Button type="button" variant={mode === 'calendar' && nights > 0 ? 'default' : 'outline'} size="sm" className="shrink-0 rounded-full">
                    {isVi ? 'Ngày chính xác' : 'Exact dates'}
                  </Button>
                  {[1, 2, 3].map((length) => (
                    <Button key={length} type="button" variant="outline" size="sm" className="shrink-0 rounded-full gap-1" onClick={() => setStayLength(length)}>
                      <Plus className="h-3.5 w-3.5" />
                      {length} {isVi ? 'đêm' : `night${length > 1 ? 's' : ''}`}
                    </Button>
                  ))}
                  {from && (
                    <Button type="button" variant="ghost" size="sm" className="shrink-0 rounded-full gap-1" onClick={() => onChange({})}>
                      <Minus className="h-3.5 w-3.5" />
                      {isVi ? 'Xóa' : 'Clear'}
                    </Button>
                  )}
                </div>
              )}

              <div className="mb-3 min-h-5 text-center text-sm text-foreground">
                {isStartOnly && from && to
                  ? `${isVi ? 'Ngày đi' : 'Start'} ${format(from, 'dd/MM/yyyy')} · ${
                    displayedFixedDays
                  } ${
                    isVi ? 'ngày' : `day${displayedFixedDays > 1 ? 's' : ''}`
                  }${
                    displayedFixedNights > 0
                      ? ` ${displayedFixedNights} ${isVi ? 'đêm' : `night${displayedFixedNights > 1 ? 's' : ''}`}`
                      : ''
                  }`
                  : mode === 'flexible' && !canApplyFlexible
                  ? isVi ? 'Chọn thời lượng và tháng đi' : 'Select days and months'
                  : rangeSummary}
              </div>
              <Button
                type="button"
                className="h-12 w-full rounded-xl text-base font-bold shadow-sm"
                disabled={mode === 'flexible' && !canApplyFlexible}
                onClick={mode === 'flexible' ? applyFlexible : () => setOpen(false)}
              >
                {isVi ? 'Xong' : 'Done'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase text-muted-foreground">{fromLabel || (isVi ? 'Ngày đi' : 'Check-in date')}</div>
          <div className="mt-0.5 text-sm font-semibold">{from ? format(from, 'dd/MM/yyyy') : '--/--/----'}</div>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase text-muted-foreground">{toLabel || (isVi ? 'Ngày về' : 'Check-out date')}</div>
          <div className="mt-0.5 text-sm font-semibold">{to ? format(to, 'dd/MM/yyyy') : '--/--/----'}</div>
        </div>
      </div>
    </div>
  );
}
