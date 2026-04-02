import { Request, Response, NextFunction } from 'express';
import { BookingService } from './service';
import { CreateBookingInput, UpdateStatusInput, BookingFilterInput } from './dto';

export class BookingController {
  private service: BookingService;

  constructor(service: BookingService) {
    this.service = service;
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.userId;
      const result = await this.service.create(studentId, req.body as CreateBookingInput);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Booking created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const result = await this.service.getById(userId, id);
      res.json({
        success: true,
        data: result,
        message: 'Booking retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const filters = req.query as unknown as BookingFilterInput;
      const result = await this.service.list(userId, filters.role, {
        status: filters.status,
        page: filters.page,
        limit: filters.limit,
      });
      res.json({
        success: true,
        data: result,
        message: 'Bookings retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const result = await this.service.updateStatus(userId, id, req.body as UpdateStatusInput);
      res.json({
        success: true,
        data: result,
        message: `Booking status updated to ${req.body.status}`,
      });
    } catch (error) {
      next(error);
    }
  };
}
