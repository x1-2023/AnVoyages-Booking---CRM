import { useState } from 'react';
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

import destinationSantorini from '@/assets/destination-santorini.jpg';
import destinationHalong from '@/assets/destination-halong.jpg';
import propertyVilla from '@/assets/property-villa-1.jpg';
import propertyCabin from '@/assets/property-cabin.jpg';
import propertyHotel from '@/assets/property-hotel.jpg';
import propertyTreehouse from '@/assets/property-treehouse.jpg';

const locationData: Record<string, { name: string; image: string; description: string }> = {
  santorini: {
    name: 'Santorini, Greece',
    image: destinationSantorini,
    description: 'Experience the iconic white-washed buildings and stunning sunsets of this Greek paradise.',
  },
  halong: {
    name: 'Ha Long Bay, Vietnam',
    image: destinationHalong,
    description: 'Explore the majestic limestone karsts rising from emerald waters in this UNESCO World Heritage site.',
  },
};

const allProperties = [
  {
    id: 'ocean-villa',
    image: propertyVilla,
    title: 'Luxury Ocean Villa',
    location: 'Santorini, Greece',
    price: 450,
    rating: 4.9,
    guests: 6,
    bedrooms: 3,
  },
  {
    id: 'mountain-cabin',
    image: propertyCabin,
    title: 'Alpine Mountain Cabin',
    location: 'Ha Long Bay, Vietnam',
    price: 280,
    rating: 4.8,
    guests: 4,
    bedrooms: 2,
  },
  {
    id: 'coastal-hotel',
    image: propertyHotel,
    title: 'Coastal Boutique Hotel',
    location: 'Santorini, Greece',
    price: 195,
    rating: 4.7,
    guests: 2,
    bedrooms: 1,
  },
  {
    id: 'jungle-treehouse',
    image: propertyTreehouse,
    title: 'Jungle Treehouse Retreat',
    location: 'Ha Long Bay, Vietnam',
    price: 165,
    rating: 4.9,
    guests: 2,
    bedrooms: 1,
  },
];

const propertyTypes = ['Villa', 'Hotel', 'Cabin', 'Apartment', 'Treehouse'];
const amenities = ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Beach Access', 'Spa'];

const DestinationPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const location = locationData[id as string] || locationData.santorini;

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
    setPriceRange({ min: 0, max: 1000 });
    setSelectedTypes([]);
    setSelectedAmenities([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-custom mx-auto px-4 md:px-8 pb-12">
            <Link
              to="/"
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
              {location.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-card/80 text-lg max-w-2xl"
            >
              {location.description}
            </motion.p>
          </div>
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
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <label htmlFor={type} className="text-sm cursor-pointer">
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
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <label htmlFor={amenity} className="text-sm cursor-pointer">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allProperties.map((property) => (
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

            {/* Filter content similar to desktop */}
            <div className="space-y-6">
              <div>
                <label className="font-medium text-sm mb-3 block">
                  {t('filter.price_range')}
                </label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" className="w-full" />
                  <span>-</span>
                  <Input type="number" placeholder="Max" className="w-full" />
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
