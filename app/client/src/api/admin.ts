import apiClient from './client';
import type { User, Tutor, AuditLog, PlatformStats, ApiResponse, PaginatedResponse } from '../types';

export const adminApi = {
  getAllUsers: async (page?: number, limit?: number, role?: string): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (role) params.append('role', role);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(`/admin/users?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch users');
    }
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch user');
    }
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update user');
    }
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  getPendingTutors: async (page?: number, limit?: number): Promise<PaginatedResponse<Tutor>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Tutor>>>(`/admin/tutors/pending?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch pending tutors');
    }
    return response.data;
  },

  verifyTutor: async (id: string): Promise<Tutor> => {
    const response = await apiClient.put<ApiResponse<Tutor>>(`/admin/tutors/${id}/verify`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to verify tutor');
    }
    return response.data;
  },

  rejectTutor: async (id: string, reason?: string): Promise<void> => {
    await apiClient.put(`/admin/tutors/${id}/reject`, { reason });
  },

  getAuditLogs: async (page?: number, limit?: number, userId?: string): Promise<PaginatedResponse<AuditLog>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (userId) params.append('userId', userId);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(`/admin/audit-logs?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch audit logs');
    }
    return response.data;
  },

  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await apiClient.get<ApiResponse<PlatformStats>>('/admin/stats');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch platform stats');
    }
    return response.data;
  },

  banUser: async (id: string, reason?: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/ban`, { reason });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to ban user');
    }
    return response.data;
  },

  unbanUser: async (id: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/unban`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to unban user');
    }
    return response.data;
  },
};

export default adminApi;