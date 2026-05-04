import { api } from '@/lib/api';

export interface Location {
  id: string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  slug: string;
  description?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  isActive: boolean;
  seoTitle?: string;
  seoTitleVi?: string;
  seoTitleEn?: string;
  seoDescription?: string;
  seoDescriptionVi?: string;
  seoDescriptionEn?: string;
  imageUrl?: string;
  _count?: {
    properties: number;
    bookings: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLocationDto {
  name: string;
  nameVi?: string;
  nameEn?: string;
  slug: string;
  description?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  isActive?: boolean;
  seoTitle?: string;
  seoTitleVi?: string;
  seoTitleEn?: string;
  seoDescription?: string;
  seoDescriptionVi?: string;
  seoDescriptionEn?: string;
  imageUrl?: string;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

export const locationService = {
  async getAll(isActive?: boolean) {
    const response = await api.get('/locations', {
      params: { isActive },
    });
    return response.data as Location[];
  },

  async getById(id: string) {
    const response = await api.get(`/locations/${id}`);
    return response.data as Location;
  },

  async getBySlug(slug: string) {
    const response = await api.get(`/locations/slug/${slug}`);
    return response.data as Location;
  },

  async create(data: CreateLocationDto) {
    const response = await api.post('/locations', data);
    return response.data as Location;
  },

  async update(id: string, data: UpdateLocationDto) {
    const response = await api.patch(`/locations/${id}`, data);
    return response.data as Location;
  },

  async delete(id: string) {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};
