import apiClient from './client';
import type { Quiz, QuizAttempt, ApiResponse, PaginatedResponse } from '../types';

export interface CreateQuizRequest {
  title: string;
  description?: string;
  subjectId?: string;
  duration: number;
  questions: {
    type: string;
    text: string;
    options?: string[];
    correctAnswer: string;
    points: number;
  }[];
}

export interface SubmitAnswerRequest {
  attemptId: string;
  questionId: string;
  answer: string;
}

export const quizzesApi = {
  getAll: async (page?: number, limit?: number): Promise<PaginatedResponse<Quiz>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Quiz>>>(`/quizzes?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch quizzes');
    }
    return response.data;
  },

  getById: async (id: string): Promise<Quiz> => {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch quiz');
    }
    return response.data;
  },

  create: async (data: CreateQuizRequest): Promise<Quiz> => {
    const response = await apiClient.post<ApiResponse<Quiz>>('/quizzes', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create quiz');
    }
    return response.data;
  },

  update: async (id: string, data: Partial<CreateQuizRequest>): Promise<Quiz> => {
    const response = await apiClient.put<ApiResponse<Quiz>>(`/quizzes/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update quiz');
    }
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${id}`);
  },

  publish: async (id: string): Promise<Quiz> => {
    const response = await apiClient.put<ApiResponse<Quiz>>(`/quizzes/${id}/publish`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to publish quiz');
    }
    return response.data;
  },

  unpublish: async (id: string): Promise<Quiz> => {
    const response = await apiClient.put<ApiResponse<Quiz>>(`/quizzes/${id}/unpublish`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to unpublish quiz');
    }
    return response.data;
  },

  startAttempt: async (quizId: string): Promise<QuizAttempt> => {
    const response = await apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/${quizId}/attempt`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to start quiz');
    }
    return response.data;
  },

  submitAnswer: async (data: SubmitAnswerRequest): Promise<QuizAttempt> => {
    const response = await apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/attempts/${data.attemptId}/answer`, {
      questionId: data.questionId,
      answer: data.answer,
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to submit answer');
    }
    return response.data;
  },

  finishAttempt: async (attemptId: string): Promise<QuizAttempt> => {
    const response = await apiClient.put<ApiResponse<QuizAttempt>>(`/quizzes/attempts/${attemptId}/finish`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to finish quiz');
    }
    return response.data;
  },

  getMyAttempts: async (): Promise<QuizAttempt[]> => {
    const response = await apiClient.get<ApiResponse<{ attempts: QuizAttempt[] }>>('/quizzes/my-attempts');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attempts');
    }
    return response.data.attempts;
  },

  getTutorQuizzes: async (): Promise<Quiz[]> => {
    const response = await apiClient.get<ApiResponse<{ quizzes: Quiz[] }>>('/quizzes/tutor-quizzes');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch quizzes');
    }
    return response.data.quizzes;
  },
};

export default quizzesApi;