import apiClient from './client';
import type { User, ApiResponse } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'tutor';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user');
    }
    return response.data.user;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Token refresh failed');
    }
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token });
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/google', { credential });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Google login failed');
    }
    return response.data;
  },
};

export default authApi;