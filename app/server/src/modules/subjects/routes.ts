import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { SubjectController } from './controller';
import { SubjectService } from './service';
import { validate } from '../../middleware/validate';
import { subjectFilterSchema } from './dto';

export function createSubjectRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new SubjectService(prisma);
  const controller = new SubjectController(service);

  router.get('/', validate(subjectFilterSchema, 'query'), controller.list);
  router.get('/:id', controller.getById);

  return router;
}
