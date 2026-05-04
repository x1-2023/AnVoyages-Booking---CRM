import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import DestinationCard from '@/components/DestinationCard';
import { locationService, Location } from '@/services/location.service';
import { propertyService, Property } from '@/services/property.service';
import { filterLocationProperties, getLocationBySlugOrId, getPriceRangeBounds, getPropertyAmenities, mapLocationHero, mapLocationToCard, mapPropertyToCard } from '@/lib/publicData';
import { useToast } from '@/hooks/use-toast';
import { setJsonLd, setSeoMeta } from '@/lib/seo';
import { getAmenityLabel } from '@/lib/amenities';

const DestinationPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const locations = await locationService.getAll(true);
        setLocations(locations);

        if (!id) {
          setLocation(null);
          setProperties([]);
          return;
        }

        const matchedLocation = getLocationBySlugOrId(locations, id);

        if (!matchedLocation) {
          setLocation(null);
          setProperties([]);
          return;
        }

        setLocation(matchedLocation);
        const propertyData = await propertyService.getAll({ locationId: matchedLocation.id, isActive: true });
        setProperties(propertyData);
        setPriceRange(getPriceRangeBounds(propertyData));
      } catch (error) {
        const message = error instanceof Error ? error.message : t('destinations.load_error');
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
      ),
    [properties],
  );

  const defaultBounds = useMemo(() => getPriceRangeBounds(properties), [properties]);

  const filteredProperties = useMemo(() => {
    if (!location) return [];

    return filterLocationProperties(
      properties,
      location.id,
      priceRange.min,
      priceRange.max,
      selectedTypes,
      selectedAmenities,
      i18n.language,
    );
  }, [i18n.language, location, priceRange.max, priceRange.min, properties, selectedAmenities, selectedTypes]);

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
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setPriceRange(defaultBounds);
  };

  useEffect(() => {
    if (!id) {
      setSeoMeta({
        title: t('seo.destinations.title'),
        description: t('seo.destinations.description'),
        keywords: t('seo.destinations.keywords'),
        canonicalUrl: `${window.location.origin}/destinations`,
      });
      setJsonLd('destinations-list', {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('seo.destinations.collection_name'),
        url: `${window.location.origin}/destinations`,
        provider: { '@type': 'TravelAgency', name: 'An Voyages' },
      });
      return;
    }

    if (!location) return;

    const localizedLocationName = location.nameEn && i18n.language.startsWith('en') ? location.nameEn : location.nameVi || location.name;
    const localizedSeoTitle = i18n.language.startsWith('en') ? location.seoTitleEn || location.seoTitle : location.seoTitleVi || location.seoTitle;
    const localizedSeoDescription = i18n.language.startsWith('en')
      ? location.seoDescriptionEn || location.seoDescription
      : location.seoDescriptionVi || location.seoDescription;
    const title = localizedSeoTitle || t('seo.destination_detail.title', { name: localizedLocationName });
    const description =
      location.seoDescription ||
      location.description ||
      t('seo.destination_detail.description', { name: localizedLocationName });

    setSeoMeta({
      title,
      description,
      keywords: t('seo.destination_detail.keywords', { name: localizedLocationName }),
      canonicalUrl: `${window.location.origin}/destinations/${location.slug || location.id}`,
      image: location.imageUrl,
    });

    setJsonLd('destination', {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: localizedLocationName,
      description,
      image: location.imageUrl,
      url: `${window.location.origin}/destinations/${location.slug || location.id}`,
    });
  }, [id, location, t]);

    const hero = location ? mapLocationHero(location, i18n.language) : null;

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24">
          <section className="px-4 pb-8 pt-6 md:px-8 md:pb-14">
            <div className="container-custom mx-auto">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                  {t('destinations.page_title')}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                  {t('destinations.page_subtitle')}
                </p>
              </div>

              {loading ? (
                <div className="mt-10 text-center text-muted-foreground">{t('destinations.loading')}</div>
              ) : locations.length === 0 ? (
                <div className="mt-10 rounded-2xl border bg-card p-8 text-center text-muted-foreground">
                  {t('destinations.empty')}
                </div>
              ) : (
                <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                  {locations.map((item) => (
              <DestinationCard key={item.id} {...mapLocationToCard(item, i18n.language)} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {hero && (
        <section className="relative h-[50vh] min-h-[400px]">
          <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-overlay" />
          <div className="absolute inset-0 flex items-end">
            <div className="container-custom mx-auto px-4 md:px-8 pb-12">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 text-card/80 hover:text-card transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.back')}
              </Link>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl md:text-5xl font-bold text-card mb-4"
              >
                {hero.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-card/80 text-lg max-w-2xl"
              >
                {hero.description}
              </motion.p>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8">
          {!loading && !location && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              {t('destinations.not_found')}
            </div>
          )}

          {(loading || location) && (
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24 bg-card p-6 rounded-2xl shadow-md border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-semibold text-lg">{t('filter.title')}</h3>
                    <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                      {t('filter.clear')}
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="font-medium text-sm mb-3 block">{t('filter.price_range')}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="font-medium text-sm mb-3 block">{t('filter.property_type')}</label>
                    <div className="space-y-2">
                      {propertyTypes.map((type) => (
                        <div key={type} className="flex items-center gap-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleType(type)}
                          />
                          <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                            {getTypeLabel(type)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="font-medium text-sm mb-3 block">{t('filter.amenities')}</label>
                    <div className="space-y-2">
                      {amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={() => toggleAmenity(amenity)}
                          />
                          <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer capitalize">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="default" className="w-full" onClick={() => undefined}>
                    {t('filter.apply')}
                  </Button>
                </div>
              </aside>

              <div className="lg:hidden">
                <Button variant="outline" onClick={() => setShowFilters(true)} className="w-full">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {t('filter.title')}
                </Button>
              </div>

              <div className="flex-1">
                <div className="mb-4 text-muted-foreground text-sm">
                  {loading ? t('properties.loading') : t('properties.result_count', { count: filteredProperties.length })}
                </div>

                {!loading && filteredProperties.length === 0 && (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                    {t('destinations.no_products')}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProperties.map((property) => (
                <PropertyCard key={property.id} {...mapPropertyToCard(property, i18n.language)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-6 max-h-[80vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t('filter.title')}</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="font-medium text-sm mb-3 block">{t('filter.price_range')}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }))}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-sm mb-3 block">{t('filter.property_type')}</label>
                <div className="space-y-2">
                  {propertyTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`mobile-type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <label htmlFor={`mobile-type-${type}`} className="text-sm cursor-pointer">
                            {getTypeLabel(type)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium text-sm mb-3 block">{t('filter.amenities')}</label>
                <div className="space-y-2">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox
                        id={`mobile-amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label htmlFor={`mobile-amenity-${amenity}`} className="text-sm cursor-pointer capitalize">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  {t('filter.clear')}
                </Button>
                <Button variant="default" className="flex-1" onClick={() => setShowFilters(false)}>
                  {t('filter.apply')}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default DestinationPage;
