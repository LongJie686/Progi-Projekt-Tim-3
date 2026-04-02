import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { PaymentController } from './controller';
import { PaymentService } from './service';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createPaymentIntentSchema, paymentFilterSchema } from './dto';

export function createPaymentRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new PaymentService(prisma);
  const controller = new PaymentController(service);

  router.post(
    '/intent',
    authenticate,
    authorize('STUDENT'),
    validate(createPaymentIntentSchema),
    controller.createIntent
  );

  // Webhook endpoint requires raw body for Stripe signature verification
  router.post(
    '/webhook',
    controller.webhook
  );

  router.get(
    '/history',
    authenticate,
    validate(paymentFilterSchema, 'query'),
    controller.history
  );

  router.post(
    '/:id/release',
    authenticate,
    authorize('ADMINISTRATOR'),
    controller.releaseEscrow
  );

  return router;
}
