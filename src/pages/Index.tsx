import { useTranslation } from 'react-i18next';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Users,
  MapPin,
  Shield,
  Headphones,
  BadgeCheck,
  Wallet,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateRangePicker from '@/components/DateRangePicker';
import { useSettings } from '@/contexts/SettingsContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import DestinationCard from '@/components/DestinationCard';
import { locationService } from '@/services/location.service';
import { propertyService, Property } from '@/services/property.service';
import { mapLocationToCard, mapPropertyToCard } from '@/lib/publicData';
import { useToast } from '@/hooks/use-toast';
import heroHalongCatba from '@/assets/hero-halong-catba.webp';
import { setJsonLd, setSeoMeta } from '@/lib/seo';

interface PublicLocation {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  _count?: {
    properties?: number;
  };
}

interface PropertyCardData {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  guests: number;
  bedrooms: number;
}

interface DestinationCardData {
  id: string;
  image: string;
  name: string;
  propertyCount: number;
}

const Index = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [destinationQuery, setDestinationQuery] = useState('');
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [destinations, setDestinations] = useState<DestinationCardData[]>([]);
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [enableParallax, setEnableParallax] = useState(false);
  const [enableMouseParallax, setEnableMouseParallax] = useState(false);
  const [enableScrollIndicator, setEnableScrollIndicator] = useState(true);
  const isVietnamese = i18n.language.startsWith('vi');
  const settingOrTranslation = (settingKey: string, translationKey: string) =>
    isVietnamese && settings[settingKey] ? settings[settingKey] : t(translationKey);

  useEffect(() => {
    setSeoMeta({
      title: t('seo.home.title'),
      description: t('seo.home.description'),
      keywords: t('seo.home.keywords'),
      canonicalUrl: window.location.origin,
      image: new URL(heroHalongCatba, window.location.origin).toString(),
    });
    setJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: 'An Voyages',
      url: window.location.origin,
      areaServed: ['Ha Long', 'Cat Ba', 'Co To', 'Quan Lan'],
      sameAs: [],
    });
  }, [t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const pointerQuery = window.matchMedia('(pointer: fine)');

    const updateMotionMode = () => {
      const isMobile = mobileQuery.matches;
      setEnableParallax(!shouldReduceMotion && !isMobile);
      setEnableMouseParallax(
        !shouldReduceMotion && !isMobile && pointerQuery.matches,
      );
      setEnableScrollIndicator(!shouldReduceMotion && !isMobile);
    };

    updateMotionMode();
    mobileQuery.addEventListener('change', updateMotionMode);
    pointerQuery.addEventListener('change', updateMotionMode);

    return () => {
      mobileQuery.removeEventListener('change', updateMotionMode);
      pointerQuery.removeEventListener('change', updateMotionMode);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        setLoadingDestinations(true);
        setLoadingProperties(true);

        const [locationsData, propertiesData] = await Promise.all([
          locationService.getAll(true),
          propertyService.getAll({ isActive: true }),
        ]);

        setDestinations(
          (locationsData as PublicLocation[]).slice(0, 4).map((location) => mapLocationToCard(location, i18n.language)),
        );
        setProperties(
          (propertiesData as Property[]).slice(0, 4).map((property) => mapPropertyToCard(property, i18n.language)),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('common.retry_later');

        toast({
          title: t('homepage.load_error'),
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoadingDestinations(false);
        setLoadingProperties(false);
      }
    };

    loadHomepageData();
  }, [i18n.language, toast, t]);

  const heroBackgroundImage = settings.hero_background_image || heroHalongCatba;
  const heroEyebrow = t('hero.eyebrow');
  const heroTitle = settingOrTranslation('hero_title', 'hero.title');
  const heroSubtitle = settingOrTranslation('hero_subtitle', 'hero.subtitle');
  const heroSummary = settingOrTranslation('home_hero_summary', 'hero.summary');
  const heroSearchPlaceholder = settingOrTranslation('home_search_placeholder', 'hero.search_input_placeholder');
  const heroQuickPlanTitle = t('hero.quick_plan_title');
  const heroQuickPlanSubtitle = t('hero.quick_plan_subtitle');
  const heroPrimaryCta = t('hero.primary_cta');
  const heroSecondaryCta = t('hero.secondary_cta');

  const destinationsTitle = settingOrTranslation('home_destinations_title', 'destinations.title');
  const destinationsSubtitle = settingOrTranslation('home_destinations_subtitle', 'destinations.subtitle');
  const propertiesTitle = settingOrTranslation('home_properties_title', 'properties.title');
  const propertiesSubtitle = settingOrTranslation('home_properties_subtitle', 'properties.subtitle');
  const featuresTitle = settingOrTranslation('home_features_title', 'features.title');
  const featuresSubtitle = settingOrTranslation('home_features_subtitle', 'features.subtitle');
  const footerCtaTitle = settingOrTranslation('home_cta_title', 'homepage.cta_title');
  const footerCtaSubtitle = settingOrTranslation('home_cta_subtitle', 'homepage.cta_subtitle');
  const footerCtaPrimaryLink = settings.home_cta_primary_link || '/properties';
  const footerCtaSecondaryLink = settings.home_cta_secondary_link || '/contact';
  const footerCtaPrimaryText =
    isVietnamese && settings.home_cta_primary_text ? settings.home_cta_primary_text : t('properties.browse_all');
  const footerCtaSecondaryText =
    isVietnamese && settings.home_cta_secondary_text ? settings.home_cta_secondary_text : heroSecondaryCta;

  const trustItems = [
    {
      icon: BadgeCheck,
      title: t('homepage.trust_items.inventory.title'),
      description: t('homepage.trust_items.inventory.description'),
    },
    {
      icon: Wallet,
      title: t('homepage.trust_items.pricing.title'),
      description: t('homepage.trust_items.pricing.description'),
    },
    {
      icon: Headphones,
      title: t('homepage.trust_items.support.title'),
      description: t('homepage.trust_items.support.description'),
    },
    {
      icon: Sparkles,
      title: t('homepage.trust_items.routes.title'),
      description: t('homepage.trust_items.routes.description'),
    },
  ];

  const heroBullets = trustItems.slice(0, 3);
  const quickDestinations = [
    t('hero.quick_destinations.ha_long'),
    t('hero.quick_destinations.cat_ba'),
    t('hero.quick_destinations.co_to'),
    t('hero.quick_destinations.quan_lan'),
  ];
  const workflowSteps = [1, 2, 3].map((step) => ({
    step: String(step).padStart(2, '0'),
    title: t(`homepage.workflow.step_${step}.title`),
    description: t(`homepage.workflow.step_${step}.description`),
  }));

  const searchHref = useMemo(() => {
    const params = new URLSearchParams();
    if (destinationQuery.trim()) params.set('q', destinationQuery.trim());
    if (checkInDate) params.set('checkIn', format(checkInDate, 'yyyy-MM-dd'));
    if (checkOutDate) params.set('checkOut', format(checkOutDate, 'yyyy-MM-dd'));
    params.set('adults', String(adultCount));
    params.set('children', String(childCount));

    const queryString = params.toString();
    return queryString ? `/properties?${queryString}` : '/properties';
  }, [adultCount, checkInDate, checkOutDate, childCount, destinationQuery]);

  const { scrollY } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  const heroImageY = useTransform(scrollY, [0, 700], [0, enableParallax ? 160 : 40]);
  const heroContentY = useTransform(scrollY, [0, 500], [0, enableParallax ? 80 : 0]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, enableParallax ? 0.15 : 1]);
  const heroScale = useTransform(scrollY, [0, 500], [1, enableParallax ? 1.08 : 1.01]);

  const destinationsY = useTransform(scrollY, [250, 800], [enableParallax ? 30 : 0, 0]);
  const propertiesY = useTransform(scrollY, [500, 1100], [enableParallax ? 30 : 0, 0]);
  const featuresY = useTransform(scrollY, [800, 1400], [enableParallax ? 30 : 0, 0]);
  const ctaY = useTransform(scrollY, [1100, 1700], [enableParallax ? 30 : 0, 0]);
  const ctaBgScale = useTransform(scrollY, [1100, 1800], [1, enableParallax ? 1.06 : 1.01]);

  const titleMouseX = useTransform(
    smoothMouseX,
    (value) => value * (enableMouseParallax ? -0.18 : 0),
  );
  const subtitleMouseX = useTransform(
    smoothMouseX,
    (value) => value * (enableMouseParallax ? -0.08 : 0),
  );
  const searchMouseX = useTransform(
    smoothMouseX,
    (value) => value * (enableMouseParallax ? 0.12 : 0),
  );
  const heroImageMouseX = useTransform(
    smoothMouseX,
    (value) => value * (enableMouseParallax ? 1 : 0),
  );
  const heroImageMouseY = useTransform(
    smoothMouseY,
    (value) => value * (enableMouseParallax ? 1 : 0),
  );
  const orbOneX = useTransform(
    smoothMouseX,
    (value) => value * (enableMouseParallax ? -1.5 : 0),
  );
  const orbOneY = useTransform(
    smoothMouseY,
    (value) => value * (enableMouseParallax ? -1.5 : 0),
  );
  const orbTwoX = useTransform(
    smoothMouseX,
    (value) => value * (enableMouseParallax ? 1.2 : 0),
  );
  const orbTwoY = useTransform(
    smoothMouseY,
    (value) => value * (enableMouseParallax ? 1.2 : 0),
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!enableMouseParallax) return;

    const x = (event.clientX / window.innerWidth - 0.5) * 32;
    const y = (event.clientY / window.innerHeight - 0.5) * 24;

    mouseX.set(x);
    mouseY.set(y);
  };

  const resetMouseParallax = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    if (enableMouseParallax) return;
    mouseX.set(0);
    mouseY.set(0);
  }, [enableMouseParallax, mouseX, mouseY]);

  const features = [
    {
      icon: Wallet,
      title: t('features.best_price.title'),
      description: t('features.best_price.description'),
    },
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.description'),
    },
    {
      icon: Headphones,
      title: t('features.support.title'),
      description: t('features.support.description'),
    },
    {
      icon: BadgeCheck,
      title: t('features.verified.title'),
      description: t('features.verified.description'),
    },
  ];

  const sectionInitial = shouldReduceMotion ? false : { opacity: 0, y: 24 };
  const cardInitial = shouldReduceMotion ? false : { opacity: 0, y: 30 };
  const hoverLift = shouldReduceMotion ? undefined : { y: -8, scale: 1.02 };
  const iconHover = shouldReduceMotion ? undefined : { scale: 1.12, rotate: 4 };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <section
        className="relative min-h-[760px] md:min-h-[840px] flex items-center overflow-hidden pt-24 md:pt-28"
        onMouseMove={enableMouseParallax ? handleMouseMove : undefined}
        onMouseLeave={enableMouseParallax ? resetMouseParallax : undefined}
      >
        <motion.div
          className="absolute inset-0"
          style={{ y: heroImageY, scale: heroScale }}
        >
          <motion.img
            src={heroBackgroundImage}
            alt="An Voyages hero"
            className="w-full h-full object-cover"
            style={{ x: heroImageMouseX, y: heroImageMouseY }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/55 to-foreground/25" />
        </motion.div>

        <motion.div
          className="absolute top-[18%] right-[10%] w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          style={{ x: orbOneX, y: orbOneY }}
        />
        <motion.div
          className="absolute bottom-[26%] left-[6%] w-48 h-48 rounded-full bg-accent/10 blur-3xl"
          style={{ x: orbTwoX, y: orbTwoY }}
        />

        <motion.div
          className="relative container mx-auto px-4 md:px-8 w-full max-w-7xl"
          style={{ y: heroContentY, opacity: heroOpacity }}
        >
          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,420px)] gap-8 xl:gap-12 items-center">
            <motion.div
              initial={sectionInitial || undefined}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.15 }}
              className="max-w-3xl"
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur"
                style={{ x: subtitleMouseX }}
              >
                <MapPin className="h-4 w-4" />
                <span>{heroEyebrow}</span>
              </motion.div>

              <motion.h1
                className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-card mb-4 md:mb-6 leading-tight"
                style={{ x: titleMouseX }}
              >
                {heroTitle}
              </motion.h1>
              <motion.p
                className="text-base md:text-xl text-card/85 mb-4 leading-relaxed max-w-2xl"
                style={{ x: subtitleMouseX }}
              >
                {heroSubtitle}
              </motion.p>
              <p className="text-sm md:text-base text-card/75 mb-6 md:mb-8 max-w-2xl">
                {heroSummary}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
                <Button asChild variant="hero" size="xl" className="w-full sm:w-auto">
                  <Link to="/properties">
                    {heroPrimaryCta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link to="/contact">{heroSecondaryCta}</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 max-w-3xl">
                {heroBullets.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-white/75">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={sectionInitial || undefined}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.35 }}
              className="glass-strong p-4 md:p-6 rounded-3xl w-full"
              style={{ x: searchMouseX }}
            >
              <div className="mb-4">
                <h2 className="text-xl font-display font-semibold text-foreground">
                  {heroQuickPlanTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {heroQuickPlanSubtitle}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="w-full space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{t('hero.search_placeholder')}</span>
                  </label>
                  <Input
                    value={destinationQuery}
                    onChange={(event) => setDestinationQuery(event.target.value)}
                    placeholder={heroSearchPlaceholder}
                    className="bg-background/50 border-border h-11 w-full"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {quickDestinations.map((destination) => (
                    <button
                      key={destination}
                      type="button"
                      onClick={() => setDestinationQuery(destination)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        destinationQuery === destination
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-primary'
                      }`}
                    >
                      {destination}
                    </button>
                  ))}
                </div>

                <DateRangePicker
                  label={t('hero.check_in') + ' / ' + t('hero.check_out')}
                  fromLabel={t('hero.check_in')}
                  toLabel={t('hero.check_out')}
                  placeholder={t('hero.date_placeholder')}
                  from={checkInDate}
                  to={checkOutDate}
                  language={i18n.language}
                  onChange={({ from, to }) => {
                    setCheckInDate(from);
                    setCheckOutDate(to);
                  }}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      {t('hero.adults')}
                    </label>
                    <Input
                      type="number"
                      value={adultCount}
                      onChange={(event) => setAdultCount(Math.max(1, Number(event.target.value) || 1))}
                      min={1}
                      max={10}
                      className="bg-background/50 border-border h-11 text-center w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      {t('hero.children')}
                    </label>
                    <Input
                      type="number"
                      value={childCount}
                      onChange={(event) => setChildCount(Math.max(0, Number(event.target.value) || 0))}
                      min={0}
                      max={10}
                      className="bg-background/50 border-border h-11 text-center w-full"
                    />
                  </div>
                </div>

                <Button asChild variant="hero" size="lg" className="h-11 w-full app-pressable">
                  <Link to={searchHref}>
                    <Search className="w-5 h-5 mr-2" />
                    {t('hero.search_button')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {enableScrollIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{ opacity: heroOpacity }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 rounded-full border-2 border-card/50 flex items-start justify-center p-2"
            >
              <div className="w-1.5 h-3 bg-card/50 rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </section>

      <section className="relative z-10 mt-6 px-4 md:-mt-10 md:px-8">
        <div className="container-custom mx-auto">
          <div className="rounded-3xl border bg-card/95 backdrop-blur shadow-xl p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
              <div>
                <p className="text-sm font-medium text-primary mb-2">
                  {t('homepage.trust_title')}
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {featuresTitle}
                </h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                {t('homepage.trust_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {trustItems.map((item) => (
                <div key={item.title} className="rounded-2xl border bg-background p-4 md:p-5">
                  <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="container-custom mx-auto">
          <div className="grid gap-3 md:grid-cols-3">
            {workflowSteps.map((item) => (
              <div key={item.step} className="app-touch-card p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-primary">
                    {t('homepage.workflow.step_label', { step: item.step })}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <motion.section className="section-padding pt-16" style={{ y: destinationsY }}>
        <div className="container-custom mx-auto">
          <motion.div
            initial={sectionInitial || undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {destinationsTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {destinationsSubtitle}
            </p>
          </motion.div>

          {loadingDestinations ? (
            <div className="text-center text-muted-foreground">{t('destinations.loading')}</div>
          ) : destinations.length === 0 ? (
            <div className="text-center text-muted-foreground">{t('destinations.empty')}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {destinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={cardInitial || undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: shouldReduceMotion ? 0 : index * 0.08 }}
                >
                  <DestinationCard {...destination} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/destinations">{t('destinations.browse_all')}</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section className="section-padding bg-muted/30" style={{ y: propertiesY }}>
        <div className="container-custom mx-auto">
          <motion.div
            initial={sectionInitial || undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {propertiesTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {propertiesSubtitle}
            </p>
          </motion.div>

          {loadingProperties ? (
            <div className="text-center text-muted-foreground">{t('properties.loading')}</div>
          ) : properties.length === 0 ? (
            <div className="text-center text-muted-foreground">{t('properties.empty')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={cardInitial || undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: shouldReduceMotion ? 0 : index * 0.08 }}
                >
                  <PropertyCard {...property} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/properties">{t('properties.browse_all')}</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section className="section-padding" style={{ y: featuresY }}>
        <div className="container-custom mx-auto">
          <motion.div
            initial={sectionInitial || undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {featuresTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {featuresSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={cardInitial || undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: shouldReduceMotion ? 0 : index * 0.08 }}
                whileHover={hoverLift}
                className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow text-center"
              >
                <motion.div
                  className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-light flex items-center justify-center"
                  whileHover={iconHover}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </motion.div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="relative py-24 overflow-hidden" style={{ y: ctaY }}>
        <motion.div
          className="absolute inset-0 bg-gradient-hero"
          style={{ scale: ctaBgScale }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        {enableParallax && (
          <>
            <motion.div
              className="absolute top-10 left-[10%] w-24 h-24 rounded-full bg-white/10 blur-2xl"
              animate={{ y: [-12, 12, -12], x: [-6, 6, -6] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-10 right-[15%] w-32 h-32 rounded-full bg-white/10 blur-2xl"
              animate={{ y: [12, -12, 12], x: [6, -6, 6] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        <div className="relative container-custom mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={sectionInitial || undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {footerCtaTitle}
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              {footerCtaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="glass" size="xl">
                <Link to={footerCtaPrimaryLink}>{footerCtaPrimaryText}</Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link to={footerCtaSecondaryLink}>{footerCtaSecondaryText}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Index;
