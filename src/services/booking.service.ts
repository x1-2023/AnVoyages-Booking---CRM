import { api } from '@/lib/api';

export interface CreateBookingDto {
  customerName: string;
  phone: string;
  email?: string;
  locationId: string;
  propertyId?: string;
  productOptionId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adultCount?: number;
  childCount?: number;
  totalPrice: number;
  depositPercent?: number;
  discountCode?: string;
  note?: string;
  bookingIntent?: 'consultation' | 'pay_deposit' | 'pay_full';
  requestedPaymentMethod?: 'sepay' | 'bank_transfer';
  paymentReference?: string;
  transferContent?: string;
  captchaToken?: string;
}

export interface UpdatePaymentDto {
  paidAmount: number;
  amount?: number;
  type?: string;
  method?: string;
  referenceCode?: string;
  paymentReference?: string;
  transferContent?: string;
  note?: string;
}

export interface SepayCheckout {
  enabled?: boolean;
  configured?: boolean;
  checkoutUrl?: string;
  method?: 'GET' | 'POST';
  fields?: Record<string, string | number | boolean | null | undefined>;
  message?: string;
}

export interface BookingResponse {
  id: string;
  bookingCode?: string;
  paymentReference?: string;
  transferContent?: string;
  depositAmount?: number;
  depositPercent?: number;
  discountCode?: string;
  totalPrice?: number;
  sepayCheckout?: SepayCheckout;
}

export const getSepayCheckoutStorageKey = (bookingId: string) => `sepay_checkout_${bookingId}`;

export const bookingService = {
  async create(data: CreateBookingDto) {
    const response = await api.post<BookingResponse>('/bookings', data);
    return response.data;
  },

  async getAll(params?: {
    status?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: string, adminNote?: string, paidAmount?: number) {
    const response = await api.patch(`/bookings/${id}/status`, {
      status,
      adminNote,
      paidAmount,
    });
    return response.data;
  },

  async updatePayment(id: string, data: UpdatePaymentDto) {
    const response = await api.patch(`/bookings/${id}/payment`, data);
    return response.data;
  },

  async createSepayCheckout(id: string, data?: { phone?: string; bookingCode?: string }) {
    const response = await api.post<BookingResponse>(`/bookings/${id}/sepay-checkout`, data ?? {});
    return response.data;
  },

  submitSepayCheckout(checkout?: SepayCheckout) {
    if (!checkout?.configured || !checkout.checkoutUrl || !checkout.fields) {
      return false;
    }

    const form = document.createElement('form');
    form.method = checkout.method || 'POST';
    form.action = checkout.checkoutUrl;
    form.style.display = 'none';

    Object.entries(checkout.fields).forEach(([name, value]) => {
      if (value === undefined || value === null) return;

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    return true;
  },

  async getStats(locationId?: string) {
    const response = await api.get('/bookings/stats', {
      params: { locationId },
    });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};
