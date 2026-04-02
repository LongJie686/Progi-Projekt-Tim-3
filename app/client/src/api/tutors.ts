import apiClient from './client';
import type { Tutor, TutorSearchFilters, PaginatedResponse, ApiResponse, AvailabilitySlot } from '../types';

export const tutorsApi = {
  search: async (filters: TutorSearchFilters): Promise<PaginatedResponse<Tutor>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Tutor>>>(`/instructors/search?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Search failed');
    }
    return response.data;
  },

  getById: async (id: string): Promise<Tutor> => {
    const response = await apiClient.get<ApiResponse<Tutor>>(`/instructors/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch tutor');
    }
    return response.data;
  },

  getAvailability: async (id: string, startDate?: string, endDate?: string): Promise<AvailabilitySlot[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<ApiResponse<{ slots: AvailabilitySlot[] }>>(`/instructors/${id}/availability?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch availability');
    }
    return response.data.slots;
  },

  updateProfile: async (data: Partial<Tutor>): Promise<Tutor> => {
    const response = await apiClient.put<ApiResponse<Tutor>>('/instructors/profile', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update profile');
    }
    return response.data;
  },

  setAvailability: async (slots: Omit<AvailabilitySlot, 'id' | 'tutorId'>[]): Promise<AvailabilitySlot[]> => {
    const response = await apiClient.post<ApiResponse<{ slots: AvailabilitySlot[] }>>('/instructors/availability', { slots });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to set availability');
    }
    return response.data.slots;
  },

  getFavorites: async (): Promise<Tutor[]> => {
    const response = await apiClient.get<ApiResponse<{ tutors: Tutor[] }>>('/instructors/favorites');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch favorites');
    }
    return response.data.tutors;
  },

  addFavorite: async (tutorId: string): Promise<void> => {
    await apiClient.post(`/instructors/${tutorId}/favorite`);
  },

  removeFavorite: async (tutorId: string): Promise<void> => {
    await apiClient.delete(`/instructors/${tutorId}/favorite`);
  },
};

export default tutorsApi;