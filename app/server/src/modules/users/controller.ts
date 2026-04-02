import { Request, Response, NextFunction } from 'express';
import { UserService } from './service';
import { UpdateUserInput } from './dto';

export class UserController {
  private service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.service.getProfile(userId);
      res.json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.service.updateProfile(userId, req.body as UpdateUserInput);
      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
