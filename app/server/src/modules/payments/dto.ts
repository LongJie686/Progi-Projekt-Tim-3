import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

export const paymentFilterSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const releaseEscrowSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
export type ReleaseEscrowInput = z.infer<typeof releaseEscrowSchema>;
