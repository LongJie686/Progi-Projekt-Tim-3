import apiClient from './client';
import type { Payment, ApiResponse } from '../types';

export interface CreatePaymentRequest {
  bookingId: string;
}

export interface StripeCheckoutResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const paymentsApi = {
  createPaymentIntent: async (bookingId: string): Promise<StripeCheckoutResponse> => {
    const response = await apiClient.post<ApiResponse<StripeCheckoutResponse>>('/payments/create-intent', { bookingId });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create payment intent');
    }
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments/confirm', { paymentIntentId });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to confirm payment');
    }
    return response.data;
  },

  getPaymentByBooking: async (bookingId: string): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/booking/${bookingId}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch payment');
    }
    return response.data;
  },

  getMyPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>('/payments/my-payments');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch payments');
    }
    return response.data.payments;
  },

  requestRefund: async (paymentId: string, reason?: string): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/refund`, { reason });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to request refund');
    }
    return response.data;
  },
};

export default paymentsApi;