import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Star, Heart, Users, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  guests: number;
  bedrooms: number;
  featured?: boolean;
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  rating,
  guests,
  bedrooms,
  featured = false,
}: PropertyCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`group relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Favorite Button */}
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-card hover:text-accent">
          <Heart className="w-5 h-5" />
        </button>

        {/* Rating */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm flex items-center gap-1.5 text-sm font-medium">
          <Star className="w-4 h-4 text-accent fill-accent" />
          {rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-display font-semibold text-foreground line-clamp-1 ${
            featured ? 'text-xl' : 'text-lg'
          }`}>
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{guests} {t('property.guests')}</span>
          </div>
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4" />
            <span>{bedrooms} {t('property.bedrooms')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">${price}</span>
            <span className="text-muted-foreground text-sm">{t('properties.per_night')}</span>
          </div>
          <Button variant="default" size="sm" asChild>
            <Link to={`/property/${id}`}>
              {t('properties.view_details')}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
