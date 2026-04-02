import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './service';
import { CreateReviewInput, UpdateReviewInput, ReviewFilterInput, ResponseInput } from './dto';

export class ReviewController {
  private service: ReviewService;

  constructor(service: ReviewService) {
    this.service = service;
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.userId;
      const result = await this.service.create(studentId, req.body as CreateReviewInput);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Review created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as ReviewFilterInput;
      const result = await this.service.list({
        tutorId: filters.tutorId,
        studentId: filters.studentId,
        page: filters.page,
        limit: filters.limit,
      });
      res.json({
        success: true,
        data: result,
        message: 'Reviews retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.userId;
      const id = String(req.params.id);
      const result = await this.service.update(id, studentId, req.body as UpdateReviewInput);
      res.json({
        success: true,
        data: result,
        message: 'Review updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  addResponse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tutorId = req.user!.userId;
      const id = String(req.params.id);
      const { response } = req.body as ResponseInput;
      const result = await this.service.addResponse(id, tutorId, response);
      res.json({
        success: true,
        data: result,
        message: 'Response added successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
