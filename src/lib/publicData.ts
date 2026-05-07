import type { Location } from '@/services/location.service';
import type { PricingRule, Property } from '@/services/property.service';
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

function parseBookingDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getBookingDates(checkIn: string, checkOut: string) {
  const start = parseBookingDate(checkIn);
  const end = parseBookingDate(checkOut);
  const dates: Date[] = [];
  if (!start || !end || end <= start) return dates;

  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function getRuleSpecificity(rule: PricingRule) {
  return [
    rule.holidayDates?.length ? 8 : 0,
    rule.startDate || rule.endDate ? 4 : 0,
    rule.weekdays?.length ? 2 : 0,
    rule.months?.length ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);
}

function matchesPricingRule(date: Date, rule: PricingRule) {
  const dateKey = toDateKey(date);
  const month = date.getUTCMonth() + 1;
  const weekday = date.getUTCDay();
  const hasHolidayConstraint = Array.isArray(rule.holidayDates) && rule.holidayDates.length > 0;
  const hasMonthConstraint = Array.isArray(rule.months) && rule.months.length > 0;
  const hasWeekdayConstraint = Array.isArray(rule.weekdays) && rule.weekdays.length > 0;
  const hasDateConstraint = Boolean(rule.startDate || rule.endDate);

  if (hasHolidayConstraint && rule.holidayDates?.includes(dateKey)) return true;
  if (hasHolidayConstraint && !hasMonthConstraint && !hasWeekdayConstraint && !hasDateConstraint) return false;
  if (hasMonthConstraint && !rule.months?.map(Number).includes(month)) return false;
  if (hasWeekdayConstraint && !rule.weekdays?.map(Number).includes(weekday)) return false;

  if (rule.startDate || rule.endDate) {
    const start = rule.startDate ? parseBookingDate(rule.startDate) : null;
    const end = rule.endDate ? parseBookingDate(rule.endDate) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
  }

  return Boolean(
    rule.price || rule.basePrice || rule.adultPrice || rule.childPrice || rule.extraFee ||
    rule.requiredMealPrice || rule.minNights || hasMonthConstraint || hasWeekdayConstraint || hasDateConstraint,
  );
}

export function getBestPricingRule(date: Date, rules: PricingRule[] = []) {
  return [...rules]
    .filter((rule) => matchesPricingRule(date, rule))
    .sort((a, b) => {
      const priorityDiff = Number(b.priority || 0) - Number(a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return getRuleSpecificity(b) - getRuleSpecificity(a);
    })[0];
}

export function calculateDynamicBookingTotal(input: {
  basePrice: number;
  adultPrice?: number;
  childPrice?: number;
  adultCount: number;
  childCount: number;
  includedGuests?: number;
  extraGuestFee?: number;
  quantity: number;
  checkIn: string;
  checkOut: string;
  rules?: PricingRule[];
  fixedDuration?: boolean;
}) {
  const dates = input.fixedDuration
    ? (parseBookingDate(input.checkIn) ? [parseBookingDate(input.checkIn) as Date] : [])
    : getBookingDates(input.checkIn, input.checkOut);
  const hasPerGuestPricing = Boolean(input.adultPrice || input.childPrice);
  const quantity = Math.max(input.quantity || 1, 1);

  if (!dates.length) {
    const guests = input.adultCount + input.childCount;
    const includedGuests = input.includedGuests ? Math.max(Number(input.includedGuests), 0) * quantity : guests;
    const extraGuestTotal = Math.max(guests - includedGuests, 0) * Number(input.extraGuestFee || 0);
    const subtotal = hasPerGuestPricing
      ? (input.adultCount * Number(input.adultPrice || input.basePrice)) + (input.childCount * Number(input.childPrice || input.adultPrice || input.basePrice))
      : input.basePrice * quantity;
    return subtotal + extraGuestTotal;
  }

  return Math.round(dates.reduce((sum, date) => {
    const rule = getBestPricingRule(date, input.rules);
    const basePrice = Number(rule?.price ?? rule?.basePrice ?? input.basePrice);
    const adultPrice = Number(rule?.adultPrice ?? input.adultPrice ?? basePrice);
    const childPrice = Number(rule?.childPrice ?? input.childPrice ?? adultPrice);
    const subtotal = hasPerGuestPricing || rule?.adultPrice || rule?.childPrice
      ? (input.adultCount * adultPrice) + (input.childCount * childPrice)
      : basePrice * quantity;
    const guests = input.adultCount + input.childCount;
    const includedGuests = input.includedGuests ? Math.max(Number(input.includedGuests), 0) * quantity : guests;
    const extraGuestTotal = Math.max(guests - includedGuests, 0) * Number(input.extraGuestFee || 0);
    const extraFee = Number(rule?.extraFee || 0) * quantity;
    const mealPrice = Number(rule?.requiredMealPrice || 0);
    const mealChargeType = rule?.requiredMealChargeType || 'guest';
    const mealTotal = mealPrice > 0
      ? mealChargeType === 'room'
        ? mealPrice * quantity
        : mealChargeType === 'adult'
          ? mealPrice * input.adultCount
          : mealPrice * (input.adultCount + input.childCount)
      : 0;

    return sum + subtotal + extraGuestTotal + extraFee + mealTotal;
  }, 0));
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
