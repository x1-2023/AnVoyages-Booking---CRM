import type { Location } from '@/services/location.service';
import type { Property } from '@/services/property.service';
import {
  getLocalizedLocationDescription,
  getLocalizedLocationName,
  getLocalizedPropertyAmenities,
  getLocalizedPropertyDescription,
  getLocalizedPropertyName,
} from '@/lib/localizedContent';
import { getAmenityLabel } from '@/lib/amenities';

const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80';
const DEFAULT_LOCATION_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80';
const DEFAULT_LOCATION_DESCRIPTION = 'Explore stays, tours, and travel experiences at this destination.';
const DEFAULT_PROPERTY_DESCRIPTION = 'Details will be updated soon.';

export function getPropertyTypeLabel(type: string) {
  const labels: Record<string, string> = {
    hotel: 'Hotel',
    homestay: 'Homestay',
    tour: 'Tour',
    cruise: 'Cruise',
  };

  return labels[type] || type.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getPropertyImages(property: Property) {
  return property.images.length > 0 ? property.images : [DEFAULT_PROPERTY_IMAGE];
}

export function getPropertyAmenities(property: Property, language?: string) {
  const amenities = getLocalizedPropertyAmenities(property, language);
  return amenities.length > 0 ? amenities : ['wifi::Wi-Fi'];
}

export function getPropertyDescription(property: Property, language?: string) {
  return getLocalizedPropertyDescription(property, language) || DEFAULT_PROPERTY_DESCRIPTION;
}

export function getPropertyGuestLimit(property: Property) {
  return property.maxGuests || 1;
}

export function getPropertyMeta() {
  return {
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.8,
    reviewCount: 24,
  };
}

export function mapPropertyToCard(property: Property, language?: string) {
  const meta = getPropertyMeta();

  return {
    id: property.id,
    image: getPropertyImages(property)[0],
    title: getLocalizedPropertyName(property, language),
    location: getLocalizedLocationName(property.location, language),
    price: property.basePrice,
    rating: meta.rating,
    guests: getPropertyGuestLimit(property),
    bedrooms: meta.bedrooms,
  };
}

export function mapLocationToCard(location: Location, language?: string) {
  return {
    id: location.slug,
    image: location.imageUrl || DEFAULT_LOCATION_IMAGE,
    name: getLocalizedLocationName(location, language),
    propertyCount: location._count?.properties || 0,
  };
}

export function mapLocationHero(location: Location, language?: string) {
  return {
    name: getLocalizedLocationName(location, language),
    image: location.imageUrl || DEFAULT_LOCATION_IMAGE,
    description: getLocalizedLocationDescription(location, language) || DEFAULT_LOCATION_DESCRIPTION,
  };
}

export function filterProperties(
  properties: Property[],
  searchQuery: string,
  minPrice: number,
  maxPrice: number,
  selectedTypes: string[] = [],
  selectedAmenities: string[] = [],
  language?: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return properties.filter((property) => {
    const matchesSearch =
      !normalizedQuery ||
      getLocalizedPropertyName(property, language).toLowerCase().includes(normalizedQuery) ||
      getLocalizedLocationName(property.location, language).toLowerCase().includes(normalizedQuery);

    const matchesPrice = property.basePrice >= minPrice && property.basePrice <= maxPrice;
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(property.type);
    const matchesAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((amenity) =>
        getPropertyAmenities(property, language).some(
          (propertyAmenity) => getAmenityLabel(propertyAmenity).toLowerCase() === getAmenityLabel(amenity).toLowerCase(),
        ),
      );

    return matchesSearch && matchesPrice && matchesType && matchesAmenities;
  });
}

export function filterLocationProperties(
  properties: Property[],
  locationId: string,
  minPrice: number,
  maxPrice: number,
  selectedTypes: string[] = [],
  selectedAmenities: string[] = [],
  language?: string,
) {
  return filterProperties(properties, '', minPrice, maxPrice, selectedTypes, selectedAmenities, language).filter(
    (property) => property.locationId === locationId,
  );
}

export function getPriceRangeBounds(properties: Property[]) {
  if (properties.length === 0) {
    return { min: 0, max: 10000000 };
  }

  const prices = properties.map((property) => property.basePrice);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function calculateBookingNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 1;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

export function calculateBookingTotal(basePrice: number, checkIn: string, checkOut: string) {
  return calculateBookingNights(checkIn, checkOut) * basePrice;
}

export function isValidBookingDates(checkIn: string, checkOut: string) {
  return Boolean(checkIn && checkOut && new Date(checkOut) > new Date(checkIn));
}

export function getPropertyBackLink(property: Property) {
  return property.location?.slug ? `/destinations/${property.location.slug}` : '/properties';
}

export function getLocationBySlugOrId(locations: Location[], slugOrId?: string) {
  if (!slugOrId) return undefined;
  return locations.find((location) => location.slug === slugOrId || location.id === slugOrId);
}

export function getRelatedProperties(properties: Property[], property: Property, language?: string) {
  return properties
    .filter((item) => item.id !== property.id && item.locationId === property.locationId)
    .slice(0, 3)
    .map((item) => mapPropertyToCard(item, language));
}

export function getPropertyDetailData(property: Property, language?: string) {
  return {
    title: getLocalizedPropertyName(property, language),
    location: getLocalizedLocationName(property.location, language),
    price: property.basePrice,
    description: getPropertyDescription(property, language),
    images: getPropertyImages(property),
    amenities: getPropertyAmenities(property, language),
    guests: getPropertyGuestLimit(property),
    ...getPropertyMeta(),
  };
}
