import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { NotificationController } from './controller';
import { NotificationService } from './service';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { notificationFilterSchema } from './dto';

export function createNotificationRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new NotificationService(prisma);
  const controller = new NotificationController(service);

  router.get(
    '/',
    authenticate,
    validate(notificationFilterSchema, 'query'),
    controller.list
  );

  router.get(
    '/unread-count',
    authenticate,
    controller.getUnreadCount
  );

  router.put(
    '/:id/read',
    authenticate,
    controller.markRead
  );

  router.put(
    '/read-all',
    authenticate,
    controller.markAllRead
  );

  return router;
}
