import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { prisma } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

// Route creators
import { createAuthRoutes } from './modules/auth/routes';
import { createUserRoutes } from './modules/users/routes';
import { createSubjectRoutes } from './modules/subjects/routes';
import { createTutorRoutes } from './modules/tutors/routes';
import { createBookingRoutes } from './modules/bookings/routes';
import { createPaymentRoutes } from './modules/payments/routes';
import { createReviewRoutes } from './modules/reviews/routes';
import { createQuizRoutes } from './modules/quizzes/routes';
import { createNotificationRoutes } from './modules/notifications/routes';
import { createAdminRoutes } from './modules/admin/routes';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Global API rate limiter
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', createAuthRoutes(prisma));
app.use('/api/users', createUserRoutes(prisma));
app.use('/api/subjects', createSubjectRoutes(prisma));
app.use('/api/tutors', createTutorRoutes(prisma));
app.use('/api/bookings', createBookingRoutes(prisma));
app.use('/api/payments', createPaymentRoutes(prisma));
app.use('/api/reviews', createReviewRoutes(prisma));
app.use('/api/quizzes', createQuizRoutes(prisma));
app.use('/api/notifications', createNotificationRoutes(prisma));
app.use('/api/admin', createAdminRoutes(prisma));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
