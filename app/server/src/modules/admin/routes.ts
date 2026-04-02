import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { AdminController } from './controller';
import { AdminService } from './service';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import {
  userFilterSchema,
  updateUserSchema,
  verifyTutorSchema,
  auditLogFilterSchema,
} from './dto';

export function createAdminRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new AdminService(prisma);
  const controller = new AdminController(service);

  router.get(
    '/users',
    authenticate,
    authorize('ADMINISTRATOR'),
    validate(userFilterSchema, 'query'),
    controller.listUsers
  );

  router.put(
    '/users/:id',
    authenticate,
    authorize('ADMINISTRATOR'),
    validate(updateUserSchema),
    controller.updateUser
  );

  router.put(
    '/tutors/:id/verify',
    authenticate,
    authorize('ADMINISTRATOR'),
    validate(verifyTutorSchema),
    controller.verifyTutor
  );

  router.get(
    '/stats',
    authenticate,
    authorize('ADMINISTRATOR'),
    controller.getStats
  );

  router.get(
    '/audit-logs',
    authenticate,
    authorize('ADMINISTRATOR'),
    validate(auditLogFilterSchema, 'query'),
    controller.getAuditLogs
  );

  return router;
}
