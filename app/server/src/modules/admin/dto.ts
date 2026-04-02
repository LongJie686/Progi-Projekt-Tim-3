import { z } from 'zod';

export const userFilterSchema = z.object({
  role: z.enum(['STUDENT', 'TUTOR', 'ADMINISTRATOR']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const updateUserSchema = z.object({
  role: z.enum(['STUDENT', 'TUTOR', 'ADMINISTRATOR']).optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const verifyTutorSchema = z.object({
  isVerified: z.boolean(),
  reason: z.string().optional(),
});

export const auditLogFilterSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type VerifyTutorInput = z.infer<typeof verifyTutorSchema>;
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;
