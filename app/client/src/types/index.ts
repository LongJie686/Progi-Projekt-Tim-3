// User Types
export type UserRole = 'student' | 'tutor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tutor extends User {
  subjects: Subject[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  availability: AvailabilitySlot[];
  education?: string;
  experience?: string;
  languages?: string[];
  location?: string;
  isVerified: boolean;
}

export interface Student extends User {
  interests: Subject[];
  bookedSessions: number;
  completedSessions: number;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  category: string;
  description?: string;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  tutor?: Tutor;
  student?: Student;
  subject: Subject;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  tutorId: string;
  studentId: string;
  student?: Student;
  rating: number;
  comment?: string;
  aspects?: {
    teaching: number;
    communication: number;
    punctuality: number;
    knowledge: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Quiz Types
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  subject?: Subject;
  tutorId: string;
  tutor?: Tutor;
  questions: Question[];
  duration: number;
  totalPoints: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quiz?: Quiz;
  studentId: string;
  answers: QuizAnswer[];
  score?: number;
  startedAt: string;
  finishedAt?: string;
  timeSpent?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'new_review'
  | 'quiz_assigned'
  | 'payment_received'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search Filter Types
export interface TutorSearchFilters {
  subject?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Dashboard Stats Types
export interface TutorDashboardStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

export interface StudentDashboardStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalSpent: number;
  favoriteTutors: number;
}

// Admin Types
export interface AuditLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalBookings: number;
  totalRevenue: number;
  activeSessions: number;
  pendingVerifications: number;
}