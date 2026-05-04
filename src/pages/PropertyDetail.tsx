import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addDays, format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  BedDouble,
  Bath,
  Wifi,
  Car,
  UtensilsCrossed,
  Waves,
  Mountain,
  Bike,
  Bus,
  ChefHat,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Clock3,
  Ship,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import DateRangePicker from '@/components/DateRangePicker';
import TurnstileWidget from '@/components/TurnstileWidget';
import { bookingService, getSepayCheckoutStorageKey } from '@/services/booking.service';
import { propertyService, Property, ProductOption } from '@/services/property.service';
import {
  calculateBookingNights,
  calculateBookingTotal,
  getPropertyBackLink,
  getPropertyDetailData,
  getRelatedProperties,
  isValidBookingDates,
} from '@/lib/publicData';
import { setJsonLd, setSeoMeta } from '@/lib/seo';
import { useLocalePreferences } from '@/contexts/LocalePreferencesContext';
import { parseAmenity } from '@/lib/amenities';
import { pickLocalizedText } from '@/lib/localizedContent';

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  pool: Waves,
  kitchen: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  meal: ChefHat,
  parking: Car,
  car: Car,
  transfer: Bus,
  bike: Bike,
  spa: Mountain,
  guide: ShieldCheck,
  kayak: Waves,
  beach: Waves,
  cruise: Ship,
  ship: Ship,
  ticket: Ticket,
  sparkle: Sparkles,
  fireplace: Mountain,
};

const parseDateValue = (value: string) => {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

function getOptionName(option: ProductOption, language?: string) {
  return pickLocalizedText(language, {
    vi: option.nameVi,
    en: option.nameEn,
    fallback: option.name,
  });
}

function getOptionDescription(option: ProductOption, language?: string) {
  return pickLocalizedText(language, {
    vi: option.descriptionVi,
    en: option.descriptionEn,
    fallback: option.description,
  });
}

function getOptionPickerLabel(type: string, language?: string) {
  const isVi = language?.startsWith('vi');

  if (type === 'cruise') return isVi ? 'Chọn hạng cabin' : 'Choose cabin type';
  if (type === 'hotel' || type === 'homestay') return isVi ? 'Chọn hạng phòng' : 'Choose room type';
  if (type === 'transport' || type === 'car-rental') return isVi ? 'Chọn loại xe' : 'Choose vehicle type';
  if (type === 'tour') return isVi ? 'Chọn gói tour' : 'Choose tour package';

  return isVi ? 'Chọn gói dịch vụ' : 'Choose service package';
}

function hasFixedStartDate(type?: string, durationDays?: number) {
  return Boolean((type === 'tour' || type === 'cruise') && durationDays && durationDays > 0);
}

function getCheckoutOffsetDays(durationDays: number) {
  return Math.max(durationDays - 1, 1);
}

function getDurationLabel(days: number, language?: string) {
  const isVi = language?.startsWith('vi');
  const safeDays = Math.max(days, 1);
  const nights = Math.max(safeDays - 1, 0);
  const daysLabel = isVi ? `${safeDays} ngày` : `${safeDays} day${safeDays > 1 ? 's' : ''}`;
  const nightsLabel = isVi ? `${nights} đêm` : `${nights} night${nights > 1 ? 's' : ''}`;

  return nights > 0 ? `${daysLabel} ${nightsLabel}` : daysLabel;
}

function getNightLabel(nights: number, language?: string) {
  const isVi = language?.startsWith('vi');
  const safeNights = Math.max(nights, 1);

  return isVi ? `${safeNights} đêm` : `${safeNights} night${safeNights > 1 ? 's' : ''}`;
}

function getGuestLabel(count: number, language?: string) {
  return language?.startsWith('vi') ? `${count} khách` : `${count} guest${count > 1 ? 's' : ''}`;
}

function getPriceLabel(type?: string, fixedDuration?: boolean, language?: string) {
  const isVi = language?.startsWith('vi');

  if (fixedDuration) return isVi ? 'theo gói' : 'per package';
  if (type === 'hotel' || type === 'homestay' || type === 'cruise') return isVi ? 'mỗi đêm' : 'per night';

  return isVi ? 'giá khởi điểm' : 'starting price';
}

const PropertyDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatMoney } = useLocalePreferences();
  const [currentImage, setCurrentImage] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    notes: '',
    depositPercent: 30,
    discountCode: '',
    productOptionId: '',
    bookingIntent: 'consultation' as 'consultation' | 'pay_deposit',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const propertyData = await propertyService.getById(id);
        setProperty(propertyData);
        setFormData((prev) => ({
          ...prev,
          guests: propertyData.maxGuests || 1,
          productOptionId: propertyData.options?.find((option) => option.isActive !== false)?.id || '',
        }));

        const relatedData = await propertyService.getAll({
          locationId: propertyData.locationId,
          isActive: true,
        });
        setAllProperties(relatedData);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('property.load_error');
        toast({
          title: t('common.error'),
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, toast, t]);

  const detail = useMemo(() => (property ? getPropertyDetailData(property, i18n.language) : null), [i18n.language, property]);
  const activeOptions = useMemo(() => property?.options?.filter((option) => option.isActive !== false) || [], [property]);
  const selectedOption = useMemo(
    () => activeOptions.find((option) => option.id === formData.productOptionId) || activeOptions[0],
    [activeOptions, formData.productOptionId],
  );
  const selectedUnitPrice = selectedOption?.basePrice || property?.basePrice || 0;
  const selectedMaxGuests = selectedOption?.maxGuests || property?.maxGuests || 1;
  const fixedDurationDays = selectedOption?.durationDays || property?.durationDays || 0;
  const shouldUseFixedStartDate = hasFixedStartDate(property?.type, fixedDurationDays);
  const fixedCheckoutOffsetDays = getCheckoutOffsetDays(fixedDurationDays);
  const relatedProperties = useMemo(
    () => (property ? getRelatedProperties(allProperties, property, i18n.language) : []),
    [allProperties, i18n.language, property],
  );
  const totalPrice = useMemo(
    () => {
      if (!property) return 0;
      return shouldUseFixedStartDate ? selectedUnitPrice : calculateBookingTotal(selectedUnitPrice, formData.checkIn, formData.checkOut);
    },
    [formData.checkIn, formData.checkOut, shouldUseFixedStartDate, property, selectedUnitPrice],
  );
  const totalNights = useMemo(
    () => (shouldUseFixedStartDate ? Math.max(fixedDurationDays - 1, 0) : calculateBookingNights(formData.checkIn, formData.checkOut)),
    [fixedDurationDays, formData.checkIn, formData.checkOut, shouldUseFixedStartDate],
  );
  const formattedNightlyPrice = formatMoney(selectedUnitPrice);
  const formattedTotalPrice = formatMoney(totalPrice);
  const priceLabel = getPriceLabel(property?.type, shouldUseFixedStartDate, i18n.language);
  const durationLabel = shouldUseFixedStartDate
    ? getDurationLabel(fixedDurationDays, i18n.language)
    : getNightLabel(totalNights, i18n.language);
  const depositPercent = formData.bookingIntent === 'pay_deposit'
    ? Math.min(Math.max(formData.depositPercent, 10), 100)
    : 0;
  const depositAmount = Math.round(totalPrice * (depositPercent / 100));
  const formattedDeposit = formatMoney(depositAmount);
  const hasSelectedDates = Boolean(formData.checkIn && formData.checkOut);
  const primaryCtaLabel =
    formData.bookingIntent === 'pay_deposit'
      ? depositPercent >= 100 ? t('booking.cta_pay_full') : t('booking.cta_deposit')
      : t('booking.submit');
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  const scrollToBooking = (intent?: 'consultation' | 'pay_deposit') => {
    if (intent) {
      setFormData((prev) => ({ ...prev, bookingIntent: intent }));
    }

    setIsBookingOpen(true);
  };

  useEffect(() => {
    if (!property || !detail) return;

    const propertySeoTitle = i18n.language.startsWith('en') ? property.seoTitleEn : property.seoTitleVi;
    const propertySeoDescription = i18n.language.startsWith('en') ? property.seoDescriptionEn : property.seoDescriptionVi;
    const propertySeoKeywords = i18n.language.startsWith('en') ? property.seoKeywordsEn : property.seoKeywordsVi;
    const title = propertySeoTitle || `${detail.title} | ${detail.location || 'An Voyages'}`;
    const description =
      propertySeoDescription ||
      detail.description ||
      t('seo.property_detail.description', { name: detail.title, location: detail.location || 'An Voyages' });
    const image = detail.images[0];

    setSeoMeta({
      title,
      description,
      keywords: propertySeoKeywords || `${detail.title}, ${detail.location || ''}, ${property.type}, An Voyages`,
      canonicalUrl: `${window.location.origin}/property/${property.id}`,
      image,
    });

    setJsonLd('product', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: detail.title,
      description,
      image: detail.images,
      brand: { '@type': 'Brand', name: 'An Voyages' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'VND',
        price: property.basePrice,
        availability: property.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${window.location.origin}/property/${property.id}`,
      },
      areaServed: detail.location,
    });
  }, [detail, i18n.language, property, t]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!property) return;

    if (!isValidBookingDates(formData.checkIn, formData.checkOut)) {
      toast({
        title: t('common.error'),
        description: t('booking.invalid_dates'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const booking = await bookingService.create({
        customerName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        locationId: property.locationId,
        propertyId: property.id,
        productOptionId: selectedOption?.id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        totalPrice,
        depositPercent,
        discountCode: formData.discountCode.trim() || undefined,
        note: [
          formData.notes,
          formData.bookingIntent === 'pay_deposit'
            ? t('booking.note_selected_payment', { percent: depositPercent, amount: formatMoney(depositAmount) })
            : t('booking.note_selected_consultation'),
          formData.discountCode.trim()
            ? t('booking.note_discount_code', { code: formData.discountCode.trim().toUpperCase() })
            : '',
          selectedOption
            ? `Option: ${getOptionName(selectedOption, i18n.language)} (${selectedOption.optionType}) - ${formatMoney(selectedOption.basePrice)}`
            : '',
        ].filter(Boolean).join('\n'),
        bookingIntent: formData.bookingIntent === 'pay_deposit' && depositPercent >= 100 ? 'pay_full' : formData.bookingIntent,
        requestedPaymentMethod: formData.bookingIntent === 'pay_deposit' ? 'sepay' : undefined,
        captchaToken: captchaToken || undefined,
      });

      if (formData.bookingIntent === 'pay_deposit') {
        if (booking.sepayCheckout?.configured && booking.sepayCheckout.checkoutUrl && booking.sepayCheckout.fields) {
          sessionStorage.setItem(
            getSepayCheckoutStorageKey(booking.id),
            JSON.stringify({ booking, checkout: booking.sepayCheckout }),
          );
          toast({
            title: t('booking.payment_session_created'),
            description: t('booking.payment_session_created_description', {
              code: booking.bookingCode || booking.paymentReference || '',
            }),
          });
          navigate(`/payment/checkout/${booking.id}`);
          return;
        }

        toast({
          title: t('booking.hold_created'),
          description: t('booking.hold_created_description'),
        });

        setFormData({
          fullName: '',
          phone: '',
          email: '',
          checkIn: '',
          checkOut: '',
          guests: property.maxGuests || 1,
          notes: '',
          depositPercent: 30,
          discountCode: '',
          productOptionId: activeOptions[0]?.id || '',
          bookingIntent: 'consultation',
        });
        setCaptchaToken('');
        return;
      }

      toast({
        title: t('common.success'),
        description: t('booking.consultation_sent_description', { name: property.name }),
      });

      setFormData({
        fullName: '',
        phone: '',
        email: '',
        checkIn: '',
        checkOut: '',
        guests: property.maxGuests || 1,
        notes: '',
        depositPercent: 30,
        discountCode: '',
        productOptionId: activeOptions[0]?.id || '',
        bookingIntent: 'consultation',
      });
      setCaptchaToken('');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('booking.submit_error');
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const nextImage = () => {
    if (!detail) return;
    setCurrentImage((prev) => (prev + 1) % detail.images.length);
  };

  const prevImage = () => {
    if (!detail) return;
    setCurrentImage((prev) => (prev - 1 + detail.images.length) % detail.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 text-center text-muted-foreground">{t('property.loading_detail')}</div>
      </div>
    );
  }

  if (!property || !detail) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 text-center text-muted-foreground">{t('property.not_found')}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-20 md:pb-0">
        <div className="container-custom mx-auto px-4 md:px-8 py-4">
          <Link
            to={getPropertyBackLink(property)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>
        </div>

        <section className="relative">
          <div className="container-custom mx-auto px-4 md:px-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl shadow-slate-950/10 md:aspect-[21/9]">
              <motion.img
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={detail.images[currentImage]}
                alt={detail.title}
                className="w-full h-full object-cover"
              />

              <button
                onClick={prevImage}
                aria-label={t('property.previous_image')}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-card md:left-4 md:h-12 md:w-12"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                aria-label={t('property.next_image')}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-card md:right-4 md:h-12 md:w-12"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {detail.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImage === index ? 'bg-card w-6' : 'bg-card/50'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button aria-label={t('property.share')} className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button aria-label={t('property.save_favorite')} className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card hover:text-accent transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-sm">
                {t('property.image_counter', { current: currentImage + 1, total: detail.images.length })}
              </div>
            </div>

            {detail.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {detail.images.slice(0, 6).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentImage(index)}
                    aria-label={t('property.view_image_number', { number: index + 1 })}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all md:h-20 md:w-32 ${
                      currentImage === index ? 'border-primary shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`${detail.title} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section-padding">
          <div className="container-custom mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {detail.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {detail.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      {detail.rating} ({detail.reviewCount} {t('property.reviews')})
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('properties.price_from')}</div>
                      <div className="mt-1 text-lg font-bold text-primary">{formattedNightlyPrice}</div>
                      <div className="text-xs text-muted-foreground">{priceLabel}</div>
                    </div>
                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('property.capacity')}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-lg font-bold">
                        <Users className="h-4 w-4 text-primary" />
                        {detail.guests}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('property.guests')}</div>
                    </div>
                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('property.bedrooms')}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-lg font-bold">
                        <BedDouble className="h-4 w-4 text-primary" />
                        {detail.bedrooms}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('property.bedrooms')}</div>
                    </div>
                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('property.booking_flow_label')}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                        <ShieldCheck className="h-4 w-4 text-secondary" />
                        {t('property.confirm_first')}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('property.consult_or_deposit')}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                    <span>{detail.guests} {t('property.guests')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <span>{detail.bedrooms} {t('property.bedrooms')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Bath className="w-5 h-5 text-primary" />
                    <span>{detail.bathrooms} {t('property.bathrooms')}</span>
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    {t('property.booking_process_title')}
                  </h2>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
                      <div>
                        <div className="font-semibold">{t('property.process.step_1.title')}</div>
                        <p className="text-sm text-muted-foreground">{t('property.process.step_1.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                      <div>
                        <div className="font-semibold">{t('property.process.step_2.title')}</div>
                        <p className="text-sm text-muted-foreground">{t('property.process.step_2.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span>
                      <div>
                        <div className="font-semibold">{t('property.process.step_3.title')}</div>
                        <p className="text-sm text-muted-foreground">{t('property.process.step_3.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    {t('property.overview')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{detail.description}</p>
                </div>

                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    {t('property.amenities')}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {detail.amenities.map((amenity) => {
                      const parsedAmenity = parseAmenity(amenity);
                      const Icon = amenityIcons[parsedAmenity.icon] || Sparkles;
                      return (
                        <div key={amenity} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                          <span>{parsedAmenity.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  id="booking-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-lg lg:sticky lg:top-24 lg:p-6"
                >
                  <div className="mb-5 rounded-2xl bg-muted/60 p-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{formattedNightlyPrice}</span>
                      <span className="text-muted-foreground">{priceLabel}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">{t('property.duration')}</div>
                        <div className="font-semibold">
                          {hasSelectedDates || shouldUseFixedStartDate ? durationLabel : t('booking.no_dates_selected')}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('booking.estimated_total')}</div>
                        <div className="font-semibold">{formattedTotalPrice}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button type="button" variant="hero" size="lg" className="w-full shadow-accent" onClick={() => scrollToBooking('pay_deposit')}>
                      <CreditCard className="mr-2 h-5 w-5" />
                      {primaryCtaLabel}
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="w-full rounded-xl" onClick={() => scrollToBooking('consultation')}>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t('booking.mobile_consult')}
                    </Button>
                    <p className="px-1 text-center text-xs text-muted-foreground">
                      {t('booking.after_submit_note', { amount: formattedDeposit })}
                    </p>
                  </div>

                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogContent className="max-h-[92vh] w-[calc(100vw-24px)] overflow-y-auto rounded-3xl p-4 max-sm:!bottom-2 max-sm:!left-2 max-sm:!right-2 max-sm:!top-[72px] max-sm:!h-auto max-sm:!max-h-none max-sm:!w-auto max-sm:!max-w-none max-sm:!translate-x-0 max-sm:!translate-y-0 sm:max-w-2xl sm:p-6">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">{primaryCtaLabel}</DialogTitle>
                        <DialogDescription>
                          {detail.title} · {detail.location}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="rounded-2xl bg-muted/60 p-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-primary">{formattedNightlyPrice}</span>
                          <span className="text-muted-foreground">{priceLabel}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">{t('property.duration')}</div>
                            <div className="font-semibold">
                              {hasSelectedDates || shouldUseFixedStartDate ? durationLabel : t('booking.no_dates_selected')}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{t('booking.estimated_total')}</div>
                            <div className="font-semibold">{formattedTotalPrice}</div>
                          </div>
                        </div>
                      </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeOptions.length > 0 && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          {getOptionPickerLabel(property.type, i18n.language)}
                        </label>
                        <RadioGroup
                          value={selectedOption?.id || ''}
                          onValueChange={(value) => {
                            const option = activeOptions.find((item) => item.id === value);
                            const nextDurationDays = option?.durationDays || property.durationDays || 0;
                            const nextUsesFixedStartDate = hasFixedStartDate(property.type, nextDurationDays);
                            const checkInDate = parseDateValue(formData.checkIn);
                            setFormData({
                              ...formData,
                              productOptionId: value,
                              guests: Math.min(formData.guests, option?.maxGuests || property.maxGuests || formData.guests),
                              checkOut: nextUsesFixedStartDate && checkInDate
                                ? format(addDays(checkInDate, getCheckoutOffsetDays(nextDurationDays)), 'yyyy-MM-dd')
                                : formData.checkOut,
                            });
                          }}
                          className="grid gap-3"
                        >
                          {activeOptions.map((option) => (
                            <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <RadioGroupItem value={option.id || ''} className="mt-1" />
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center justify-between gap-2 font-medium">
                                  <span>{getOptionName(option, i18n.language)}</span>
                                  <span className="text-primary">{formatMoney(option.basePrice)}</span>
                                </span>
                                {getOptionDescription(option, i18n.language) && (
                                  <span className="mt-1 block text-xs text-muted-foreground">
                                    {getOptionDescription(option, i18n.language)}
                                  </span>
                                )}
                                <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {option.maxGuests ? <span>{getGuestLabel(option.maxGuests, i18n.language)}</span> : null}
                                  {option.durationDays ? <span>{getDurationLabel(option.durationDays, i18n.language)}</span> : null}
                                  {option.bedType ? <span>{option.bedType}</span> : null}
                                  {option.areaSqm ? <span>{option.areaSqm}m2</span> : null}
                                </span>
                              </span>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t('booking.full_name')}
                      </label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t('booking.email')}
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t('booking.phone')}
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <DateRangePicker
                      label={shouldUseFixedStartDate ? t('booking.check_in') : `${t('booking.check_in')} / ${t('booking.check_out')}`}
                      fromLabel={t('booking.check_in')}
                      toLabel={shouldUseFixedStartDate ? t('booking.end_date') : t('booking.check_out')}
                      placeholder={t('booking.date_placeholder')}
                      from={parseDateValue(formData.checkIn)}
                      to={parseDateValue(formData.checkOut)}
                      selectionMode={shouldUseFixedStartDate ? 'start' : 'range'}
                      fixedNights={fixedCheckoutOffsetDays}
                      fixedDays={fixedDurationDays}
                      language={i18n.language}
                      onChange={({ from, to }) =>
                        setFormData({
                          ...formData,
                          checkIn: from ? format(from, 'yyyy-MM-dd') : '',
                          checkOut: shouldUseFixedStartDate
                            ? from ? format(addDays(from, fixedCheckoutOffsetDays), 'yyyy-MM-dd') : ''
                            : to ? format(to, 'yyyy-MM-dd') : '',
                        })
                      }
                    />

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t('booking.guests')}
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={selectedMaxGuests}
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t('booking.intent_label')}
                      </label>
                      <RadioGroup
                        value={formData.bookingIntent}
                        onValueChange={(value) => setFormData({ ...formData, bookingIntent: value as 'consultation' | 'pay_deposit' })}
                        className="grid gap-3"
                      >
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value="consultation" className="mt-1" />
                          <span>
                            <span className="flex items-center gap-2 font-medium">
                              <MessageCircle className="h-4 w-4" />
                              {t('booking.consultation_title')}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {t('booking.consultation_description')}
                            </span>
                          </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value="pay_deposit" className="mt-1" />
                          <span>
                            <span className="flex items-center gap-2 font-medium">
                              <CreditCard className="h-4 w-4" />
                              {t('booking.deposit_title')}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {t('booking.deposit_description')}
                            </span>
                          </span>
                        </label>
                      </RadioGroup>
                    </div>

                    {formData.bookingIntent === 'pay_deposit' && (
                      <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-foreground">
                              {depositPercent >= 100 ? t('booking.pay_full_title') : t('booking.deposit_percent_title')}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {t('booking.deposit_slider_help')}
                            </p>
                          </div>
                          <div className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                            {depositPercent}%
                          </div>
                        </div>

                        <Slider
                          value={[depositPercent]}
                          min={10}
                          max={100}
                          step={5}
                          onValueChange={([value]) => setFormData({ ...formData, depositPercent: value })}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-card p-3">
                            <div className="text-xs text-muted-foreground">{t('booking.deposit_amount_label')}</div>
                            <div className="mt-1 font-bold text-primary">{formattedDeposit}</div>
                          </div>
                          <div className="rounded-lg bg-card p-3">
                            <div className="text-xs text-muted-foreground">{t('booking.remaining_after_label')}</div>
                            <div className="mt-1 font-bold">{formatMoney(Math.max(totalPrice - depositAmount, 0))}</div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {t('booking.payment_link_note')}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t('booking.discount_label')}
                      </label>
                      <Input
                        value={formData.discountCode}
                        onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
                        placeholder={t('booking.discount_placeholder')}
                        maxLength={32}
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {t('booking.discount_hint')}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t('booking.notes')}
                      </label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder={t('booking.notes_placeholder')}
                        rows={3}
                      />
                    </div>

                    <div className="rounded-xl border bg-background p-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <Clock3 className="h-4 w-4 text-primary" />
                        {t('booking.after_submit_title')}
                      </div>
                      <p className="mt-1">
                        {t('booking.after_submit_note', { amount: formattedDeposit })}
                      </p>
                    </div>

                    {turnstileSiteKey && (
                      <TurnstileWidget
                        siteKey={turnstileSiteKey}
                        onVerify={setCaptchaToken}
                        onExpire={() => setCaptchaToken('')}
                      />
                    )}

                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving || Boolean(turnstileSiteKey && !captchaToken)}>
                      {saving ? t('booking.submitting') : primaryCtaLabel}
                    </Button>

                  </form>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {relatedProperties.length > 0 && (
          <section className="section-padding bg-muted/30">
            <div className="container-custom mx-auto px-4 md:px-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                {t('property.similar')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProperties.map((related) => (
                  <PropertyCard key={related.id} {...related} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-[84px] z-50 border-t border-border/80 bg-card/95 px-4 py-3 shadow-2xl shadow-slate-950/15 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-foreground">
              {formattedNightlyPrice} <span className="font-medium text-muted-foreground">{priceLabel}</span>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {hasSelectedDates
                ? `${durationLabel} · ${formattedTotalPrice}`
                : t('booking.choose_dates_for_total')}
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0 px-3" onClick={() => scrollToBooking('consultation')}>
            {t('booking.mobile_consult')}
          </Button>
          <Button type="button" variant="hero" size="sm" className="shrink-0 px-4" onClick={() => scrollToBooking('pay_deposit')}>
            {t('booking.mobile_hold')}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
