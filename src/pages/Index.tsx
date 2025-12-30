import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Calendar, Users, MapPin, Shield, Headphones, BadgeCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import DestinationCard from '@/components/DestinationCard';

// Import images
import heroBeach from '@/assets/hero-beach.jpg';
import destinationSantorini from '@/assets/destination-santorini.jpg';
import destinationHalong from '@/assets/destination-halong.jpg';
import destinationTokyo from '@/assets/destination-tokyo.jpg';
import destinationBali from '@/assets/destination-bali.jpg';
import propertyVilla from '@/assets/property-villa-1.jpg';
import propertyCabin from '@/assets/property-cabin.jpg';
import propertyHotel from '@/assets/property-hotel.jpg';
import propertyTreehouse from '@/assets/property-treehouse.jpg';

const destinations = [
  { id: 'santorini', image: destinationSantorini, name: 'Santorini', propertyCount: 128, featured: true },
  { id: 'halong', image: destinationHalong, name: 'Ha Long Bay', propertyCount: 85 },
  { id: 'tokyo', image: destinationTokyo, name: 'Tokyo', propertyCount: 312 },
  { id: 'bali', image: destinationBali, name: 'Bali', propertyCount: 256 },
];

const properties = [
  {
    id: 'ocean-villa',
    image: propertyVilla,
    title: 'Luxury Ocean Villa',
    location: 'Maldives, Indian Ocean',
    price: 450,
    rating: 4.9,
    guests: 6,
    bedrooms: 3,
    featured: true,
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
];

const Index = () => {
  const { t } = useTranslation();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBeach}
            alt="Tropical beach paradise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative container-custom mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-card mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-card/80 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="glass-strong p-4 md:p-6 rounded-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('hero.search_placeholder')}
                  </label>
                  <Input
                    placeholder="Bali, Tokyo, Santorini..."
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('hero.check_in')}
                  </label>
                  <Input type="date" className="bg-background/50 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('hero.check_out')}
                  </label>
                  <Input type="date" className="bg-background/50 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('hero.guests')}
                  </label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue={2} min={1} className="bg-background/50 border-border flex-1" />
                    <Button variant="hero" size="lg" className="px-6">
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-card/50 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-card/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Destinations Section */}
      <section className="section-padding">
        <div className="container-custom mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('destinations.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('destinations.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} {...destination} />
            ))}
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('properties.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('properties.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-custom mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow text-center group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative container-custom mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              Join thousands of travelers who have discovered their perfect getaway with us.
            </p>
            <Button variant="glass" size="xl">
              Explore All Destinations
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
