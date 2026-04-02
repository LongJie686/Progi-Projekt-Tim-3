import apiClient from './client';
import type { Booking, ApiResponse, PaginatedResponse } from '../types';

export interface CreateBookingRequest {
  tutorId: string;
  subjectId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export const bookingsApi = {
  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Booking failed');
    }
    return response.data;
  },

  getMyBookings: async (status?: string, page?: number, limit?: number): Promise<PaginatedResponse<Booking>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(`/bookings/my-bookings?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch bookings');
    }
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch booking');
    }
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to cancel booking');
    }
    return response.data;
  },

  confirm: async (id: string): Promise<Booking> => {
    const response = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/confirm`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to confirm booking');
    }
    return response.data;
  },

  complete: async (id: string): Promise<Booking> => {
    const response = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/complete`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to complete booking');
    }
    return response.data;
  },

  getTutorBookings: async (status?: string, page?: number, limit?: number): Promise<PaginatedResponse<Booking>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(`/bookings/tutor-bookings?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch tutor bookings');
    }
    return response.data;
  },

  updateNotes: async (id: string, notes: string): Promise<Booking> => {
    const response = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/notes`, { notes });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update notes');
    }
    return response.data;
  },
};

export default bookingsApi;