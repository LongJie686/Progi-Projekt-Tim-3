import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { ReviewController } from './controller';
import { ReviewService } from './service';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createReviewSchema, updateReviewSchema, reviewFilterSchema, responseSchema } from './dto';

export function createReviewRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new ReviewService(prisma);
  const controller = new ReviewController(service);

  router.post(
    '/',
    authenticate,
    authorize('STUDENT'),
    validate(createReviewSchema),
    controller.create
  );

  router.get(
    '/',
    validate(reviewFilterSchema, 'query'),
    controller.list
  );

  router.put(
    '/:id',
    authenticate,
    validate(updateReviewSchema),
    controller.update
  );

  router.post(
    '/:id/response',
    authenticate,
    authorize('TUTOR'),
    validate(responseSchema),
    controller.addResponse
  );

  return router;
}
