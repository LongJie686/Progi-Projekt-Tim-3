import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { TutorController } from './controller';
import { TutorService } from './service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  searchTutorsSchema,
  updateProfileSchema,
  availabilitySchema,
} from './dto';

export function createTutorRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new TutorService(prisma);
  const controller = new TutorController(service);

  router.get('/', validate(searchTutorsSchema, 'query'), controller.search);
  router.get('/:id', controller.getProfile);
  router.put('/:id/profile', authenticate, authorize('TUTOR'), validate(updateProfileSchema), controller.updateProfile);
  router.get('/:id/availability', controller.getAvailability);
  router.put('/:id/availability', authenticate, authorize('TUTOR'), validate(availabilitySchema), controller.setAvailability);

  return router;
}
