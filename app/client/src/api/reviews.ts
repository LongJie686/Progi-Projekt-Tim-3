import apiClient from './client';
import type { Review, ApiResponse, PaginatedResponse } from '../types';

export interface CreateReviewRequest {
  bookingId: string;
  tutorId: string;
  rating: number;
  comment?: string;
  aspects?: {
    teaching: number;
    communication: number;
    punctuality: number;
    knowledge: number;
  };
}

export const reviewsApi = {
  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create review');
    }
    return response.data;
  },

  getByTutor: async (tutorId: string, page?: number, limit?: number): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Review>>>(`/reviews/tutor/${tutorId}?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch reviews');
    }
    return response.data;
  },

  getByBooking: async (bookingId: string): Promise<Review | null> => {
    const response = await apiClient.get<ApiResponse<Review>>(`/reviews/booking/${bookingId}`);
    if (!response.success) {
      return null;
    }
    return response.data || null;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get<ApiResponse<{ reviews: Review[] }>>('/reviews/my-reviews');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch reviews');
    }
    return response.data.reviews;
  },

  update: async (id: string, data: Partial<CreateReviewRequest>): Promise<Review> => {
    const response = await apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update review');
    }
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};

export default reviewsApi;