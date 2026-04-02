import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './service';
import { NotificationFilterInput } from './dto';

export class NotificationController {
  private service: NotificationService;

  constructor(service: NotificationService) {
    this.service = service;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const filters = req.query as unknown as NotificationFilterInput;
      const result = await this.service.list(userId, filters);
      res.json({
        success: true,
        data: result,
        message: 'Notifications retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.service.getUnreadCount(userId);
      res.json({
        success: true,
        data: result,
        message: 'Unread count retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const notificationId = String(req.params.id);
      const result = await this.service.markRead(notificationId, userId);
      res.json({
        success: true,
        data: result,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.service.markAllRead(userId);
      res.json({
        success: true,
        data: result,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  };
}
