import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { propertyService, Property } from '@/services/property.service';
import { filterProperties, getPriceRangeBounds, getPropertyAmenities, mapPropertyToCard } from '@/lib/publicData';
import { getLocalizedLocationName } from '@/lib/localizedContent';
import { getAmenityLabel } from '@/lib/amenities';
import { useToast } from '@/hooks/use-toast';
import { setJsonLd, setSeoMeta } from '@/lib/seo';
import { useLocalePreferences } from '@/contexts/LocalePreferencesContext';

const formatShortPrice = (price: number, locale: string, currency: string, convertedPrice: number) =>
  new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency,
  }).format(convertedPrice);

const PropertiesPage = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
  const { currency, convertFromVnd } = useLocalePreferences();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    setSeoMeta({
      title: t('seo.properties.title'),
      description: t('seo.properties.description'),
      keywords: t('seo.properties.keywords'),
      canonicalUrl: `${window.location.origin}/properties`,
    });
    setJsonLd('properties-list', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('seo.properties.collection_name'),
      url: `${window.location.origin}/properties`,
      provider: { '@type': 'Organization', name: 'An Voyages' },
    });
  }, [t]);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getAll({ isActive: true });
        setProperties(data);

        const bounds = getPriceRangeBounds(data);
        setPriceRange(bounds);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('properties.load_error');
        toast({
          title: t('common.error'),
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [toast, t]);

  const getTypeLabel = (type: string) => t(`property_types.${type}`, {
    defaultValue: type.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
  });

  const propertyTypes = useMemo(
    () => Array.from(new Set(properties.map((property) => property.type))),
    [properties],
  );

  const amenities = useMemo(
    () =>
      Array.from(
        new Set(properties.flatMap((property) => getPropertyAmenities(property, i18n.language).map((amenity) => getAmenityLabel(amenity).toLowerCase()))),
      ).slice(0, 12),
    [properties],
  );

  const defaultBounds = useMemo(() => getPriceRangeBounds(properties), [properties]);

  const filteredProperties = useMemo(
    () =>
      filterProperties(
        properties,
        searchQuery,
        priceRange.min,
        priceRange.max,
        selectedTypes,
        selectedAmenities,
        i18n.language,
      ),
    [i18n.language, priceRange.max, priceRange.min, properties, searchQuery, selectedAmenities, selectedTypes],
  );

  const featuredLocations = useMemo(
    () =>
      Array.from(new Set(properties.map((property) => getLocalizedLocationName(property.location, i18n.language)).filter(Boolean))).slice(0, 4),
    [i18n.language, properties],
  );

  const activeFilterCount =
    selectedTypes.length +
    selectedAmenities.length +
    (searchQuery.trim() ? 1 : 0) +
    (priceRange.min !== defaultBounds.min || priceRange.max !== defaultBounds.max ? 1 : 0);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity],
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setPriceRange(defaultBounds);
  };

  const renderFilterControls = (prefix: string) => (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="font-medium text-sm">{t('filter.price_range')}</label>
          <span className="text-xs text-muted-foreground">
            {formatShortPrice(priceRange.min, locale, currency, convertFromVnd(priceRange.min))} - {formatShortPrice(priceRange.max, locale, currency, convertFromVnd(priceRange.max))}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }))}
            className="h-11 rounded-lg"
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
            className="h-11 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="font-medium text-sm mb-3 block">{t('filter.property_type')}</label>
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map((type) => {
            const checked = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                  checked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/50'
                }`}
              >
                {getTypeLabel(type)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="font-medium text-sm mb-3 block">{t('filter.amenities')}</label>
        <div className="grid grid-cols-1 gap-2">
          {amenities.map((amenity) => (
            <label
              key={amenity}
              htmlFor={`${prefix}-amenity-${amenity}`}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition hover:border-primary/50"
            >
              <span className="capitalize">{amenity}</span>
              <Checkbox
                id={`${prefix}-amenity-${amenity}`}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-muted/30 pt-24 pb-6 md:pb-10">
        <div className="container-custom mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl"
          >
            <Badge variant="secondary" className="mb-4 border-0 bg-card text-primary shadow-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              An Voyages
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
              {t('properties.title')}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
              {t('properties.subtitle')}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <MapPin className="h-4 w-4 text-primary" />
                {featuredLocations.length > 0 ? featuredLocations.join(', ') : 'Ha Long, Cat Ba, Co To'}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <CalendarDays className="h-4 w-4 text-primary" />
                {t('properties.route_badge')}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('properties.clear_pricing_badge')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:top-20">
        <div className="container-custom mx-auto px-4 md:px-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('hero.search_placeholder')}
                className="h-12 rounded-xl pl-10 text-base shadow-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="h-12 rounded-xl px-4 lg:hidden"
              aria-label={t('filter.title')}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {propertyTypes.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              <button
                type="button"
                onClick={() => setSelectedTypes([])}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                  selectedTypes.length === 0
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                {t('filter.all')}
              </button>
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                    selectedTypes.includes(type)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  {getTypeLabel(type)}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="container-custom mx-auto px-4 md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            <aside className="hidden w-72 flex-shrink-0 lg:block">
              <div className="sticky top-40 rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{t('filter.title')}</h3>
                    <p className="text-xs text-muted-foreground">{t('filter.selected_count', { count: activeFilterCount })}</p>
                  </div>
                  <button onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
                    {t('filter.clear')}
                  </button>
                </div>

                {renderFilterControls('desktop')}
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {loading ? t('properties.loading') : t('properties.result_count', { count: filteredProperties.length })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('properties.filter_hint')}
                  </p>
                </div>

                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start sm:self-auto">
                    <X className="h-4 w-4" />
                    {t('filter.clear')}
                  </Button>
                )}
              </div>

              {!loading && filteredProperties.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <h3 className="font-display text-xl font-semibold text-foreground">{t('properties.no_results_title')}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('properties.no_results_description')}
                  </p>
                  <Button variant="outline" className="mt-5" onClick={clearFilters}>
                    {t('filter.clear')}
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                      <div className="aspect-[16/11] animate-pulse bg-muted" />
                      <div className="space-y-3 p-4">
                        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-10 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProperties.map((property, index) => (
                    <PropertyCard
                      key={property.id}
                      {...mapPropertyToCard(property, i18n.language)}
                      category={getTypeLabel(property.type)}
                      durationDays={property.durationDays}
                      amenities={getPropertyAmenities(property, i18n.language)}
                      reviewCount={property._count?.bookings}
                      featured={index < 2}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-auto rounded-t-xl bg-card p-5 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">{t('filter.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('filter.selected_count', { count: activeFilterCount })}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderFilterControls('mobile')}

            <div className="sticky bottom-0 -mx-5 mt-8 flex gap-3 border-t border-border bg-card p-5">
              <Button variant="outline" className="flex-1" onClick={clearFilters}>
                {t('filter.clear')}
              </Button>
              <Button variant="default" className="flex-1" onClick={() => setShowFilters(false)}>
                {t('filter.apply')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default PropertiesPage;
