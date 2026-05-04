import { api } from '@/lib/api';

export interface Lead {
  id: string;
  status: string;
  travelDate?: string;
  numPeople: number;
  budget?: number;
  source?: string;
  notes?: string;
  assignedTo?: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  property?: {
    id: string;
    name: string;
    location?: { name: string };
  };
  createdAt: string;
}

export const leadService = {
  async getAll(params?: { status?: string }) {
    const response = await api.get('/leads', { params });
    return response.data as Lead[];
  },

  async create(data: unknown) {
    const response = await api.post('/leads', data);
    return response.data as Lead;
  },

  async updateStatus(id: string, status: string) {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data as Lead;
  },

  async update(id: string, data: unknown) {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data as Lead;
  },

  async delete(id: string) {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};
