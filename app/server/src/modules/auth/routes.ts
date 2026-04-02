import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { AuthController } from './controller';
import { AuthService } from './service';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { loginLimiter, registerLimiter } from '../../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './dto';

export function createAuthRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const service = new AuthService(prisma);
  const controller = new AuthController(service);

  router.post('/register', registerLimiter, validate(registerSchema), controller.register);
  router.post('/login', loginLimiter, validate(loginSchema), controller.login);
  router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
  router.post('/logout', authenticate, controller.logout);
  router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
  router.post('/forgot-password', loginLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
  router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
  router.get('/oauth/google', controller.googleOAuth);
  router.get('/oauth/github', controller.githubOAuth);

  return router;
}
