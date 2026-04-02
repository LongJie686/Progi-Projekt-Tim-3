import apiClient from './client';
import type { Notification, ApiResponse, PaginatedResponse } from '../types';

export const notificationsApi = {
  getAll: async (page?: number, limit?: number): Promise<PaginatedResponse<Notification>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(`/notifications?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch notifications');
    }
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch unread count');
    }
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to mark as read');
    }
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await apiClient.delete('/notifications');
  },
};

export default notificationsApi;