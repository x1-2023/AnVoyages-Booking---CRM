import { api } from '@/lib/api';

export interface Supplier {
  id: string;
  name: string;
  type: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  contractRate?: string;
  notes?: string;
  properties?: Array<{ id: string; name: string }>;
}

export const supplierService = {
  async getAll() {
    const response = await api.get('/suppliers');
    return response.data as Supplier[];
  },

  async create(data: Partial<Supplier>) {
    const response = await api.post('/suppliers', data);
    return response.data as Supplier;
  },

  async update(id: string, data: Partial<Supplier>) {
    const response = await api.patch(`/suppliers/${id}`, data);
    return response.data as Supplier;
  },

  async delete(id: string) {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};
