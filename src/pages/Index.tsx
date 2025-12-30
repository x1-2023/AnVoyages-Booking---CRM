import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll-based parallax
  const { scrollY } = useScroll();
  
  // Hero section parallax transforms
  const heroImageY = useTransform(scrollY, [0, 700], [0, 200]);
  const heroContentY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  
  // Section parallax transforms
  const destinationsY = useTransform(scrollY, [300, 800], [50, 0]);
  const propertiesY = useTransform(scrollY, [600, 1100], [50, 0]);
  const featuresY = useTransform(scrollY, [900, 1400], [50, 0]);
  const ctaY = useTransform(scrollY, [1200, 1700], [50, 0]);
  
  // Mouse parallax for hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    mouseX.set(x * 20);
    mouseY.set(y * 15);
  };

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
    <div className="min-h-screen bg-background" ref={containerRef}>
      <Navbar />

      {/* Hero Section with Parallax */}
      <section 
        className="relative h-screen min-h-[700px] flex items-center overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: heroImageY, scale: heroScale }}
        >
          <motion.img
            src={heroBeach}
            alt="Tropical beach paradise"
            className="w-full h-full object-cover"
            style={{ 
              x: smoothMouseX,
              y: smoothMouseY,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-[20%] right-[10%] w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          style={{ 
            x: useTransform(smoothMouseX, (v) => v * -1.5),
            y: useTransform(smoothMouseY, (v) => v * -1.5),
          }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[5%] w-48 h-48 rounded-full bg-accent/10 blur-3xl"
          style={{ 
            x: useTransform(smoothMouseX, (v) => v * 1.2),
            y: useTransform(smoothMouseY, (v) => v * 1.2),
          }}
        />

        {/* Content with Parallax */}
        <motion.div 
          className="relative container-custom mx-auto px-4 md:px-8"
          style={{ y: heroContentY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <motion.h1 
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-card mb-6 leading-tight"
              style={{ 
                x: useTransform(smoothMouseX, (v) => v * -0.2),
              }}
            >
              {t('hero.title')}
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-card/80 mb-8 leading-relaxed"
              style={{ 
                x: useTransform(smoothMouseX, (v) => v * -0.1),
              }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="glass-strong p-4 md:p-6 rounded-2xl"
              style={{ 
                x: useTransform(smoothMouseX, (v) => v * 0.1),
              }}
            >
              <div className="flex flex-col md:flex-row gap-3 items-end">
                {/* Location */}
                <div className="flex-1 min-w-0 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{t('hero.search_placeholder')}</span>
                  </label>
                  <Input
                    placeholder="Bali, Tokyo, Santorini..."
                    className="bg-background/50 border-border h-11"
                  />
                </div>
                
                {/* Check-in */}
                <div className="flex-1 min-w-0 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    {t('hero.check_in')}
                  </label>
                  <Input type="date" className="bg-background/50 border-border h-11" />
                </div>
                
                {/* Check-out */}
                <div className="flex-1 min-w-0 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    {t('hero.check_out')}
                  </label>
                  <Input type="date" className="bg-background/50 border-border h-11" />
                </div>
                
                {/* Adults */}
                <div className="w-20 flex-shrink-0 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    {t('hero.adults')}
                  </label>
                  <Input 
                    type="number" 
                    defaultValue={2} 
                    min={1} 
                    max={10}
                    className="bg-background/50 border-border h-11 text-center" 
                  />
                </div>
                
                {/* Children */}
                <div className="w-20 flex-shrink-0 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    {t('hero.children')}
                  </label>
                  <Input 
                    type="number" 
                    defaultValue={0} 
                    min={0} 
                    max={10}
                    className="bg-background/50 border-border h-11 text-center" 
                  />
                </div>
                
                {/* Search Button */}
                <div className="flex-shrink-0">
                  <Button variant="hero" size="lg" className="h-11 px-6">
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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
      </section>

      {/* Destinations Section with Parallax */}
      <motion.section 
        className="section-padding"
        style={{ y: destinationsY }}
      >
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
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <DestinationCard {...destination} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Properties Section with Parallax */}
      <motion.section 
        className="section-padding bg-muted/30"
        style={{ y: propertiesY }}
      >
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
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard {...property} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section with Parallax */}
      <motion.section 
        className="section-padding"
        style={{ y: featuresY }}
      >
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
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow text-center group"
              >
                <motion.div 
                  className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-light flex items-center justify-center"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </motion.div>
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
      </motion.section>

      {/* CTA Section with Parallax */}
      <motion.section 
        className="relative py-24 overflow-hidden"
        style={{ y: ctaY }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-hero"
          style={{ 
            scale: useTransform(scrollY, [1200, 1800], [1, 1.1]),
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-10 left-[10%] w-24 h-24 rounded-full bg-white/10 blur-2xl"
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-[15%] w-32 h-32 rounded-full bg-white/10 blur-2xl"
          animate={{ 
            y: [20, -20, 20],
            x: [10, -10, 10],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="glass" size="xl">
                Explore All Destinations
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Index;
