import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { QuizController } from './controller';
import { QuizService } from './service';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createQuizSchema, quizFilterSchema, submitAnswersSchema } from './dto';

export function createQuizRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new QuizService(prisma);
  const controller = new QuizController(service);

  router.post(
    '/',
    authenticate,
    authorize('TUTOR', 'ADMINISTRATOR'),
    validate(createQuizSchema),
    controller.create
  );

  router.get(
    '/',
    authenticate,
    validate(quizFilterSchema, 'query'),
    controller.list
  );

  router.get(
    '/:id',
    authenticate,
    controller.getById
  );

  router.post(
    '/:id/attempt',
    authenticate,
    authorize('STUDENT'),
    controller.startAttempt
  );

  router.put(
    '/:id/attempt/:attemptId',
    authenticate,
    validate(submitAnswersSchema),
    controller.submitAttempt
  );

  router.get(
    '/:id/attempt/:attemptId/result',
    authenticate,
    controller.getResult
  );

  return router;
}
