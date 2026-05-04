import type { Location } from '@/services/location.service';
import type { ProductCategory, Property } from '@/services/property.service';

export type ContentLanguage = 'vi' | 'en';

export function normalizeContentLanguage(language?: string): ContentLanguage {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'vi';
}

export function pickLocalizedText(
  language: string | undefined,
  values: { vi?: string | null; en?: string | null; fallback?: string | null },
) {
  const normalized = normalizeContentLanguage(language);
  const preferred = normalized === 'en' ? values.en : values.vi;
  return preferred || values.fallback || values.vi || values.en || '';
}

export function getLocalizedLocationName(location?: Pick<Location, 'name' | 'nameVi' | 'nameEn'>, language?: string) {
  if (!location) return '';
  return pickLocalizedText(language, {
    vi: location.nameVi,
    en: location.nameEn,
    fallback: location.name,
  });
}

export function getLocalizedLocationDescription(location: Location, language?: string) {
  return pickLocalizedText(language, {
    vi: location.descriptionVi,
    en: location.descriptionEn,
    fallback: location.description,
  });
}

export function getLocalizedCategoryName(category: ProductCategory, language?: string) {
  return pickLocalizedText(language, {
    vi: category.nameVi,
    en: category.nameEn,
    fallback: category.name,
  });
}

export function getLocalizedPropertyName(property: Property, language?: string) {
  return pickLocalizedText(language, {
    vi: property.nameVi,
    en: property.nameEn,
    fallback: property.name,
  });
}

export function getLocalizedPropertyDescription(property: Property, language?: string) {
  return pickLocalizedText(language, {
    vi: property.descriptionVi,
    en: property.descriptionEn,
    fallback: property.description,
  });
}

export function getLocalizedPropertyAmenities(property: Property, language?: string) {
  const normalized = normalizeContentLanguage(language);
  const preferred = normalized === 'en' ? property.amenitiesEn : property.amenitiesVi;
  return preferred && preferred.length > 0 ? preferred : property.amenities;
}
