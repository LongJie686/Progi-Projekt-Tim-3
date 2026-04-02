import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Tutor, PaginatedResponse, TutorSearchFilters } from '../types';
import apiClient from '../api/client';

interface TutorsState {
  tutors: Tutor[];
  selectedTutor: Tutor | null;
  filters: TutorSearchFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: TutorsState = {
  tutors: [],
  selectedTutor: null,
  filters: {
    subject: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    rating: undefined,
    availability: undefined,
    search: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const searchTutors = createAsyncThunk<PaginatedResponse<Tutor>, TutorSearchFilters>(
  'tutors/searchTutors',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get(`/instructors/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchTutorById = createAsyncThunk<Tutor, string>(
  'tutors/fetchTutorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/instructors/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tutor');
    }
  }
);

const tutorsSlice = createSlice({
  name: 'tutors',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TutorSearchFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearSelectedTutor: (state) => {
      state.selectedTutor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchTutors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTutors.fulfilled, (state, action) => {
        state.tutors = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.loading = false;
      })
      .addCase(searchTutors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTutorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutorById.fulfilled, (state, action) => {
        state.selectedTutor = action.payload;
        state.loading = false;
      })
      .addCase(fetchTutorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, setPage, clearSelectedTutor } = tutorsSlice.actions;
export default tutorsSlice.reducer;