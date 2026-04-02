import apiClient from './client';
import type { Subject, ApiResponse } from '../types';

export const subjectsApi = {
  getAll: async (): Promise<Subject[]> => {
    const response = await apiClient.get<ApiResponse<{ subjects: Subject[] }>>('/subjects');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch subjects');
    }
    return response.data.subjects;
  },

  getByCategory: async (category: string): Promise<Subject[]> => {
    const response = await apiClient.get<ApiResponse<{ subjects: Subject[] }>>(`/subjects/category/${category}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch subjects');
    }
    return response.data.subjects;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<{ categories: string[] }>>('/subjects/categories');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch categories');
    }
    return response.data.categories;
  },

  getById: async (id: string): Promise<Subject> => {
    const response = await apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch subject');
    }
    return response.data;
  },
};

export default subjectsApi;