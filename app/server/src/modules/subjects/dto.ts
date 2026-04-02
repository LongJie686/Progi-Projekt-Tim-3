import { z } from 'zod';

export const subjectFilterSchema = z.object({
  category: z.enum([
    'mathematics',
    'physics',
    'chemistry',
    'biology',
    'computer_science',
    'english',
    'history',
    'geography',
    'other',
  ]).optional(),
  level: z.enum([
    'elementary',
    'middle_school',
    'high_school',
    'university',
    'professional',
  ]).optional(),
});

export type SubjectFilterInput = z.infer<typeof subjectFilterSchema>;
