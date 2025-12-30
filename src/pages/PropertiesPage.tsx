import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';

import propertyVilla from '@/assets/property-villa-1.jpg';
import propertyCabin from '@/assets/property-cabin.jpg';
import propertyHotel from '@/assets/property-hotel.jpg';
import propertyTreehouse from '@/assets/property-treehouse.jpg';

const allProperties = [
  {
    id: 'ocean-villa',
    image: propertyVilla,
    title: 'Luxury Ocean Villa',
    location: 'Maldives, Indian Ocean',
    price: 450,
    rating: 4.9,
    guests: 6,
    bedrooms: 3,
  },
  {
    id: 'mountain-cabin',
    image: propertyCabin,
    title: 'Alpine Mountain Cabin',
    location: 'Swiss Alps, Switzerland',
    price: 280,
    rating: 4.8,
    guests: 4,
    bedrooms: 2,
  },
  {
    id: 'coastal-hotel',
    image: propertyHotel,
    title: 'Coastal Boutique Hotel',
    location: 'Amalfi Coast, Italy',
    price: 195,
    rating: 4.7,
    guests: 2,
    bedrooms: 1,
  },
  {
    id: 'jungle-treehouse',
    image: propertyTreehouse,
    title: 'Jungle Treehouse Retreat',
    location: 'Ubud, Bali',
    price: 165,
    rating: 4.9,
    guests: 2,
    bedrooms: 1,
  },
  {
    id: 'beach-resort',
    image: propertyVilla,
    title: 'Beachfront Resort Suite',
    location: 'Phuket, Thailand',
    price: 320,
    rating: 4.6,
    guests: 4,
    bedrooms: 2,
  },
  {
    id: 'city-apartment',
    image: propertyHotel,
    title: 'Modern City Apartment',
    location: 'Tokyo, Japan',
    price: 150,
    rating: 4.5,
    guests: 2,
    bedrooms: 1,
  },
];

const propertyTypes = ['Villa', 'Hotel', 'Cabin', 'Apartment', 'Treehouse', 'Resort'];
const amenities = ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Beach Access', 'Spa', 'Gym'];

const PropertiesPage = () => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange({ min: 0, max: 1000 });
    setSelectedTypes([]);
    setSelectedAmenities([]);
  };

  const filteredProperties = allProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container-custom mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('properties.title')}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              {t('properties.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('hero.search_placeholder')}
                className="pl-12 h-14 text-lg rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-card p-6 rounded-2xl shadow-md border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-semibold text-lg">{t('filter.title')}</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('filter.clear')}
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="font-medium text-sm mb-3 block">
                    {t('filter.price_range')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div className="mb-6">
                  <label className="font-medium text-sm mb-3 block">
                    {t('filter.property_type')}
                  </label>
                  <div className="space-y-2">
                    {propertyTypes.map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <label className="font-medium text-sm mb-3 block">
                    {t('filter.amenities')}
                  </label>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="default" className="w-full">
                  {t('filter.apply')}
                </Button>
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="w-full"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {t('filter.title')}
              </Button>
            </div>

            {/* Property Grid */}
            <div className="flex-1">
              <div className="mb-4 text-muted-foreground text-sm">
                {filteredProperties.length} properties found
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Modal */}
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
                <label className="font-medium text-sm mb-3 block">
                  {t('filter.price_range')}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: Number(e.target.value) })
                    }
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: Number(e.target.value) })
                    }
                  />
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

export default PropertiesPage;
