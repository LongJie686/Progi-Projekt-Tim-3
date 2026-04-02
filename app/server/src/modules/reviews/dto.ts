import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  communication: z.number().int().min(1).max(5).optional(),
  expertise: z.number().int().min(1).max(5).optional(),
  preparation: z.number().int().min(1).max(5).optional(),
  value: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  expertise: z.number().int().min(1).max(5).optional(),
  preparation: z.number().int().min(1).max(5).optional(),
  value: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const reviewFilterSchema = z.object({
  tutorId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const responseSchema = z.object({
  response: z.string().min(1, 'Response cannot be empty').max(500, 'Response cannot exceed 500 characters'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewFilterInput = z.infer<typeof reviewFilterSchema>;
export type ResponseInput = z.infer<typeof responseSchema>;
