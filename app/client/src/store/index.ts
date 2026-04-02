import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tutorsReducer from './tutorsSlice';
import bookingsReducer from './bookingsSlice';
import notificationsReducer from './notificationsSlice';
import quizzesReducer from './quizzesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tutors: tutorsReducer,
    bookings: bookingsReducer,
    notifications: notificationsReducer,
    quizzes: quizzesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;