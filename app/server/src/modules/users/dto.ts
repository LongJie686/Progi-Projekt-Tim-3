import { z } from 'zod';

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
