import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';

import propertyVilla from '@/assets/property-villa-1.jpg';
import propertyCabin from '@/assets/property-cabin.jpg';
import propertyHotel from '@/assets/property-hotel.jpg';
import propertyTreehouse from '@/assets/property-treehouse.jpg';

const propertyData = {
  'ocean-villa': {
    id: 'ocean-villa',
    title: 'Luxury Ocean Villa',
    location: 'Maldives, Indian Ocean',
    price: 450,
    rating: 4.9,
    reviewCount: 128,
    guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    images: [propertyVilla, propertyHotel, propertyCabin],
    description:
      'Experience ultimate luxury in this stunning overwater villa with breathtaking ocean views. Perfect for families or groups seeking an unforgettable tropical getaway.',
    amenities: ['wifi', 'pool', 'kitchen', 'parking', 'spa', 'beach'],
  },
  'mountain-cabin': {
    id: 'mountain-cabin',
    title: 'Alpine Mountain Cabin',
    location: 'Swiss Alps, Switzerland',
    price: 280,
    rating: 4.8,
    reviewCount: 95,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    images: [propertyCabin, propertyVilla, propertyTreehouse],
    description:
      'Cozy mountain retreat with stunning alpine views and modern amenities. Perfect for skiing in winter or hiking in summer.',
    amenities: ['wifi', 'fireplace', 'kitchen', 'parking'],
  },
};

const relatedProperties = [
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

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  pool: Waves,
  kitchen: UtensilsCrossed,
  parking: Car,
  spa: Mountain,
  beach: Waves,
  fireplace: Mountain,
};

const PropertyDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    notes: '',
  });

  const property = propertyData[id as keyof typeof propertyData] || propertyData['ocean-villa'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('booking.success'),
      description: `Booking request for ${property.title} has been sent!`,
    });
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Back Button */}
        <div className="container-custom mx-auto px-4 md:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>
        </div>

        {/* Image Gallery */}
        <section className="relative">
          <div className="container-custom mx-auto px-4 md:px-8">
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden">
              <motion.img
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={property.images[currentImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImage === index ? 'bg-card w-6' : 'bg-card/50'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card hover:text-accent transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding">
          <div className="container-custom mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {property.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      {property.rating} ({property.reviewCount} {t('property.reviews')})
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                    <span>{property.guests} {t('property.guests')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <span>{property.bedrooms} {t('property.bedrooms')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Bath className="w-5 h-5 text-primary" />
                    <span>{property.bathrooms} {t('property.bathrooms')}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    {t('property.overview')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    {t('property.amenities')}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity] || Wifi;
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="capitalize">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky top-24 bg-card p-6 rounded-2xl shadow-lg border border-border"
                >
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-primary">${property.price}</span>
                    <span className="text-muted-foreground">{t('property.per_night')}</span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
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
                        required
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {t('booking.check_in')}
                        </label>
                        <Input
                          type="date"
                          value={formData.checkIn}
                          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {t('booking.check_out')}
                        </label>
                        <Input
                          type="date"
                          value={formData.checkOut}
                          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t('booking.guests')}
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={property.guests}
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                        required
                      />
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

                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      {t('booking.submit')}
                    </Button>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Properties */}
        <section className="section-padding bg-muted/30">
          <div className="container-custom mx-auto px-4 md:px-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              {t('property.similar')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((prop) => (
                <PropertyCard key={prop.id} {...prop} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
