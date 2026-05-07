import { api } from '@/lib/api';

export interface ProductCategory {
  id: string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  slug: string;
  description?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PricingRule {
  name?: string;
  startDate?: string;
  endDate?: string;
  months?: number[];
  weekdays?: number[];
  holidayDates?: string[];
  price?: number;
  basePrice?: number;
  adultPrice?: number;
  childPrice?: number;
  extraFee?: number;
  minNights?: number;
  requiredMealName?: string;
  requiredMealPrice?: number;
  requiredMealChargeType?: 'guest' | 'adult' | 'room';
  priority?: number;
}

export interface ProductOption {
  id?: string;
  propertyId?: string;
  optionType: 'room' | 'cabin' | 'package' | 'vehicle' | 'addon' | string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  description?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  basePrice: number;
  adultPrice?: number;
  childPrice?: number;
  costPrice?: number;
  maxGuests?: number;
  maxAdults?: number;
  maxChildren?: number;
  includedGuests?: number;
  extraGuestFee?: number;
  inventoryQuantity?: number;
  durationDays?: number;
  bedType?: string;
  bedCount?: number;
  areaSqm?: number;
  images?: string[];
  amenities?: string[];
  amenitiesVi?: string[];
  amenitiesEn?: string[];
  pricingRules?: PricingRule[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface Property {
  id: string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  description?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  type: string;
  basePrice: number;
  adultPrice?: number;
  childPrice?: number;
  extraFee?: number;
  pricingRules?: PricingRule[];
  maxGuests?: number;
  images: string[];
  amenities: string[];
  amenitiesVi?: string[];
  amenitiesEn?: string[];
  isActive: boolean;
  locationId: string;
  supplierId?: string;
  costPrice?: number;
  durationDays?: number;
  options?: ProductOption[];
  seoTitleVi?: string;
  seoTitleEn?: string;
  seoDescriptionVi?: string;
  seoDescriptionEn?: string;
  seoKeywordsVi?: string;
  seoKeywordsEn?: string;
  location?: {
    id: string;
    name: string;
    nameVi?: string;
    nameEn?: string;
    slug: string;
    seoTitle?: string;
    seoTitleVi?: string;
    seoTitleEn?: string;
    seoDescription?: string;
    seoDescriptionVi?: string;
    seoDescriptionEn?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

export interface OptionAvailability {
  available: boolean;
  limited: boolean;
  requestedUnits: number;
  minimumAvailableUnits: number | null;
  dates: Array<{
    date: string;
    totalUnits: number;
    bookedUnits: number;
    availableUnits: number;
    closed: boolean;
  }>;
}

export interface InventoryCalendarDay {
  date: string;
  totalUnits: number;
  bookedUnits: number;
  availableUnits: number;
  closed: boolean;
  isOverride: boolean;
  note?: string;
}

export interface InventoryCalendarOption extends ProductOption {
  defaultUnits: number;
  dates: InventoryCalendarDay[];
}

export interface InventoryCalendar {
  property: Property;
  startDate: string;
  endDate: string;
  options: InventoryCalendarOption[];
}

export interface CreatePropertyDto {
  name: string;
  nameVi?: string;
  nameEn?: string;
  description?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  type: string;
  basePrice: number;
  adultPrice?: number;
  childPrice?: number;
  extraFee?: number;
  pricingRules?: PricingRule[];
  maxGuests?: number;
  images: string[];
  amenities: string[];
  amenitiesVi?: string[];
  amenitiesEn?: string[];
  isActive: boolean;
  locationId: string;
  supplierId?: string;
  costPrice?: number;
  durationDays?: number;
  options?: ProductOption[];
  seoTitleVi?: string;
  seoTitleEn?: string;
  seoDescriptionVi?: string;
  seoDescriptionEn?: string;
  seoKeywordsVi?: string;
  seoKeywordsEn?: string;
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>;

export const propertyService = {
  async getAll(params?: { locationId?: string; type?: string; isActive?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.locationId) queryParams.append('locationId', params.locationId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

    const response = await api.get(`/properties?${queryParams.toString()}`);
    return response.data as Property[];
  },

  async getById(id: string) {
    const response = await api.get(`/properties/${id}`);
    return response.data as Property;
  },

  async getAvailability(id: string, params: { productOptionId?: string; checkIn?: string; checkOut?: string; adults?: number; children?: number }) {
    const response = await api.get(`/properties/${id}/availability`, { params });
    return response.data as OptionAvailability;
  },

  async getInventory(id: string, params?: { startDate?: string; days?: number }) {
    const response = await api.get(`/properties/${id}/inventory`, { params });
    return response.data as InventoryCalendar;
  },

  async updateOptionInventory(optionId: string, data: { date: string; totalUnits: number; closed?: boolean; note?: string }) {
    const response = await api.patch(`/properties/options/${optionId}/inventory`, data);
    return response.data;
  },

  async deleteOptionInventory(optionId: string, date: string) {
    const response = await api.delete(`/properties/options/${optionId}/inventory`, { params: { date } });
    return response.data;
  },

  async create(data: CreatePropertyDto) {
    const response = await api.post('/properties', data);
    return response.data as Property;
  },

  async update(id: string, data: UpdatePropertyDto) {
    const response = await api.patch(`/properties/${id}`, data);
    return response.data as Property;
  },

  async delete(id: string) {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  async getCategories(isActive?: boolean) {
    const response = await api.get('/properties/categories', { params: { isActive } });
    return response.data as ProductCategory[];
  },

  async createCategory(data: { name: string; nameVi?: string; nameEn?: string; slug?: string; description?: string; descriptionVi?: string; descriptionEn?: string; isActive?: boolean }) {
    const response = await api.post('/properties/categories', data);
    return response.data as ProductCategory;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/media/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data as { url: string; filename: string; size: number; mimeType: string };
  },
};
