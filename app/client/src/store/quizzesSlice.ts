import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Quiz, QuizAttempt } from '../types';
import apiClient from '../api/client';

interface QuizzesState {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  currentAttempt: QuizAttempt | null;
  attempts: QuizAttempt[];
  loading: boolean;
  error: string | null;
}

const initialState: QuizzesState = {
  quizzes: [],
  selectedQuiz: null,
  currentAttempt: null,
  attempts: [],
  loading: false,
  error: null,
};

export const fetchQuizzes = createAsyncThunk<Quiz[]>(
  'quizzes/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/quizzes');
      return response.data.quizzes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizById = createAsyncThunk<Quiz, string>(
  'quizzes/fetchQuizById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/quizzes/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const startQuizAttempt = createAsyncThunk<QuizAttempt, string>(
  'quizzes/startQuizAttempt',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/attempt`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start quiz');
    }
  }
);

export const submitAnswer = createAsyncThunk<
  QuizAttempt,
  { attemptId: string; questionId: string; answer: string }
>(
  'quizzes/submitAnswer',
  async ({ attemptId, questionId, answer }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/quizzes/attempts/${attemptId}/answer`, {
        questionId,
        answer,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer');
    }
  }
);

export const finishQuizAttempt = createAsyncThunk<QuizAttempt, string>(
  'quizzes/finishQuizAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/quizzes/attempts/${attemptId}/finish`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finish quiz');
    }
  }
);

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearSelectedQuiz: (state) => {
      state.selectedQuiz = null;
      state.currentAttempt = null;
    },
    setCurrentAttempt: (state, action: PayloadAction<QuizAttempt | null>) => {
      state.currentAttempt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.quizzes = action.payload;
        state.loading = false;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.selectedQuiz = action.payload;
        state.loading = false;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(startQuizAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startQuizAttempt.fulfilled, (state, action) => {
        state.currentAttempt = action.payload;
        state.loading = false;
      })
      .addCase(startQuizAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.currentAttempt = action.payload;
      })
      .addCase(finishQuizAttempt.fulfilled, (state, action) => {
        state.currentAttempt = action.payload;
        state.attempts.push(action.payload);
      });
  },
});

export const { clearSelectedQuiz, setCurrentAttempt } = quizzesSlice.actions;
export default quizzesSlice.reducer;