import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { BookingController } from './controller';
import { BookingService } from './service';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createBookingSchema, updateStatusSchema, bookingFilterSchema } from './dto';

export function createBookingRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new BookingService(prisma);
  const controller = new BookingController(service);

  router.post(
    '/',
    authenticate,
    authorize('STUDENT'),
    validate(createBookingSchema),
    controller.create
  );

  router.get(
    '/',
    authenticate,
    validate(bookingFilterSchema, 'query'),
    controller.list
  );

  router.get(
    '/:id',
    authenticate,
    controller.getById
  );

  router.put(
    '/:id/status',
    authenticate,
    validate(updateStatusSchema),
    controller.updateStatus
  );

  return router;
}
