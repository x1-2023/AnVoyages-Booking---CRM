import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, Heart, MapPin, Star, Tag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalePreferences } from '@/contexts/LocalePreferencesContext';
import { getAmenityLabel } from '@/lib/amenities';

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  guests: number;
  bedrooms?: number;
  category?: string;
  durationDays?: number;
  amenities?: string[];
  reviewCount?: number;
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
  category,
  durationDays,
  amenities = [],
  reviewCount,
  featured = false,
}: PropertyCardProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useLocalePreferences();
  const formattedPrice = formatMoney(price);
  const durationLabel = durationDays && durationDays > 0
    ? t('property.duration_days_short', { count: durationDays })
    : t('property.flexible_duration');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative overflow-hidden aspect-[16/11] bg-muted">
        <Link to={`/property/${id}`} className="absolute inset-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/5 to-transparent" />
        </Link>
        <button
          type="button"
          aria-label="Save trip"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition hover:bg-card hover:text-accent"
        >
          <Heart className="w-5 h-5" />
        </button>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {featured && (
            <Badge className="border-0 bg-accent text-accent-foreground shadow-sm">
              {t('properties.featured')}
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="border-0 bg-card/90 text-foreground shadow-sm backdrop-blur">
              {category}
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-card">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{location || 'Vietnam'}</span>
            </div>
            <h3 className="line-clamp-2 font-display text-xl font-bold leading-tight text-card">
              {title}
            </h3>
          </div>
          <div className="shrink-0 rounded-lg bg-card/95 px-2.5 py-1.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-2">
            <Clock3 className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{durationLabel}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-2">
            <Users className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{guests} {t('property.guests')}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-2">
            <Star className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{reviewCount ? `${reviewCount}+` : '24+'}</span>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                <Tag className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{getAmenityLabel(amenity)}</span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('properties.price_from')}</p>
            <div className="text-xl font-bold leading-tight text-primary sm:text-2xl">{formattedPrice}</div>
          </div>
          <Button variant="default" size="sm" asChild className="shrink-0">
            <Link to={`/property/${id}`}>
              {t('properties.view_details')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
