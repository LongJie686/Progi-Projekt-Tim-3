import { z } from 'zod';

export const notificationFilterSchema = z.object({
  isRead: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;
