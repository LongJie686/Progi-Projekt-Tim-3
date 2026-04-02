import { Request, Response, NextFunction } from 'express';
import { AdminService } from './service';
import { UserFilterInput, UpdateUserInput, VerifyTutorInput, AuditLogFilterInput } from './dto';

export class AdminController {
  private service: AdminService;

  constructor(service: AdminService) {
    this.service = service;
  }

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as UserFilterInput;
      const result = await this.service.listUsers(filters);
      res.json({
        success: true,
        data: result,
        message: 'Users retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      const userId = String(req.params.id);
      const result = await this.service.updateUser(adminId, userId, req.body as UpdateUserInput);
      res.json({
        success: true,
        data: result,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  verifyTutor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      const tutorId = String(req.params.id);
      const result = await this.service.verifyTutor(adminId, tutorId, req.body as VerifyTutorInput);
      res.json({
        success: true,
        data: result,
        message: 'Tutor verification updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getStats();
      res.json({
        success: true,
        data: result,
        message: 'Platform statistics retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as AuditLogFilterInput;
      const result = await this.service.getAuditLogs(filters);
      res.json({
        success: true,
        data: result,
        message: 'Audit logs retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
