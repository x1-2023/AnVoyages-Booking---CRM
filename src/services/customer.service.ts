import { api } from '@/lib/api';

export interface Communication {
  id: string;
  customerId: string;
  type: 'note' | 'call' | 'message' | string;
  direction: 'internal' | 'inbound' | 'outbound' | string;
  content: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  notes?: string;
  createdAt: string;
  bookings?: Array<{
    id: string;
    bookingCode?: string;
    totalPrice: number;
    status: string;
    checkIn?: string;
    checkOut?: string;
    createdAt?: string;
    property?: { name: string };
  }>;
  leads?: Array<{
    id: string;
    status: string;
    source?: string;
    notes?: string;
    travelDate?: string;
    createdAt?: string;
    property?: { name: string };
  }>;
  communications?: Communication[];
}

export const customerService = {
  async getAll(q?: string) {
    const response = await api.get('/customers', { params: q ? { q } : undefined });
    return response.data as Customer[];
  },

  async getOne(id: string) {
    const response = await api.get(`/customers/${id}`);
    return response.data as Customer;
  },

  async create(data: Partial<Customer>) {
    const response = await api.post('/customers', data);
    return response.data as Customer;
  },

  async update(id: string, data: Partial<Customer>) {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data as Customer;
  },

  async delete(id: string) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  async createCommunication(
    customerId: string,
    data: Pick<Communication, 'type' | 'direction' | 'content'>,
  ) {
    const response = await api.post(`/customers/${customerId}/communications`, data);
    return response.data as Communication;
  },
};
