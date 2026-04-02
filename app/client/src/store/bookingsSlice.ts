import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Booking } from '../types';
import apiClient from '../api/client';

interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  upcomingBookings: [],
  pastBookings: [],
  loading: false,
  error: null,
};

export const fetchUserBookings = createAsyncThunk<Booking[]>(
  'bookings/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/bookings/my-bookings');
      return response.data.bookings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk<Booking, string>(
  'bookings/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const cancelBooking = createAsyncThunk<Booking, string>(
  'bookings/cancelBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.upcomingBookings = [];
      state.pastBookings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
        const now = new Date();
        state.upcomingBookings = action.payload.filter(
          (b) => new Date(b.startTime) > now && b.status !== 'cancelled'
        );
        state.pastBookings = action.payload.filter(
          (b) => new Date(b.startTime) <= now || b.status === 'cancelled'
        );
        state.loading = false;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.selectedBooking = action.payload;
        state.loading = false;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.upcomingBookings = state.bookings.filter(
          (b) => new Date(b.startTime) > new Date() && b.status !== 'cancelled'
        );
        state.loading = false;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedBooking, clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;