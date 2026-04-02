import { z } from 'zod';

export const createBookingSchema = z.object({
  tutorId: z.string().uuid('Invalid tutor ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format'),
  format: z.enum(['online', 'in_person']),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'End time must be after start time', path: ['endTime'] }
);

export const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']),
  cancellationReason: z.string().max(500).optional(),
});

export const bookingFilterSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  role: z.enum(['student', 'tutor']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>;
