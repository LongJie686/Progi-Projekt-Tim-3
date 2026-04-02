import { Request, Response, NextFunction } from 'express';
import { SubjectService } from './service';

export class SubjectController {
  private service: SubjectService;

  constructor(service: SubjectService) {
    this.service = service;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjects = await this.service.list(req.query as any);
      res.json({
        success: true,
        data: subjects,
        message: 'Subjects retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const subject = await this.service.getById(id);
      res.json({
        success: true,
        data: subject,
        message: 'Subject retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
