import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { UserController } from './controller';
import { UserService } from './service';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateUserSchema } from './dto';

export function createUserRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new UserService(prisma);
  const controller = new UserController(service);

  router.get('/me', authenticate, controller.getMe);
  router.put('/me', authenticate, validate(updateUserSchema), controller.updateMe);

  return router;
}
