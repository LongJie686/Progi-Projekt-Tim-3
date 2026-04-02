import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './dto';

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService) {
    this.service = service;
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body as RegisterInput);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body as LoginInput);
      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const tokens = await this.service.refresh(refreshToken);
      res.json({
        success: true,
        data: tokens,
        message: 'Tokens refreshed',
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.service.logout(userId);
      res.json({
        success: true,
        data: null,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body as VerifyEmailInput;
      const result = await this.service.verifyEmail(token);
      res.json({
        success: true,
        data: null,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.forgotPassword(req.body as ForgotPasswordInput);
      res.json({
        success: true,
        data: null,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.resetPassword(req.body as ResetPasswordInput);
      res.json({
        success: true,
        data: null,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  googleOAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Implement Google OAuth token verification
      res.json({
        success: true,
        data: null,
        message: 'Google OAuth callback',
      });
    } catch (error) {
      next(error);
    }
  };

  githubOAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Implement GitHub OAuth token verification
      res.json({
        success: true,
        data: null,
        message: 'GitHub OAuth callback',
      });
    } catch (error) {
      next(error);
    }
  };
}
