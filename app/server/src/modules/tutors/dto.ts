import { z } from 'zod';

export const searchTutorsSchema = z.object({
  subject: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxRate: z.coerce.number().positive().optional(),
  location: z.string().optional(),
  format: z.enum(['online', 'in_person']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['rating', 'price_asc', 'price_desc', 'reviews', 'newest']).default('rating'),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(2000, 'Bio must be at most 2000 characters').optional(),
  education: z.array(z.string()).max(10, 'Maximum 10 education entries').optional(),
  hourlyRate30: z.number().positive().optional(),
  hourlyRate45: z.number().positive().optional(),
  hourlyRate60: z.number().positive().optional(),
  hourlyRate90: z.number().positive().optional(),
  onlineRate: z.number().positive().optional(),
  location: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  introVideoUrl: z.string().url('Invalid video URL').optional(),
});

export const availabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    })
  ).min(1, 'At least one time slot is required'),
});

export type SearchTutorsInput = z.infer<typeof searchTutorsSchema>;
export type UpdateTutorProfileInput = z.infer<typeof updateProfileSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
