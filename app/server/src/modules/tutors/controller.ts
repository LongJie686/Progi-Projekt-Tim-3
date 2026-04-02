import { Request, Response, NextFunction } from 'express';
import { TutorService } from './service';
import { SearchTutorsInput, UpdateTutorProfileInput, AvailabilityInput } from './dto';

export class TutorController {
  private service: TutorService;

  constructor(service: TutorService) {
    this.service = service;
  }

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.search(req.query as unknown as SearchTutorsInput);
      res.json({
        success: true,
        data: result,
        message: 'Tutors retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const tutor = await this.service.getProfile(id);
      res.json({
        success: true,
        data: tutor,
        message: 'Tutor profile retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.user!.userId;
      const tutor = await this.service.updateProfile(id, userId, req.body as UpdateTutorProfileInput);
      res.json({
        success: true,
        data: tutor,
        message: 'Tutor profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const slots = await this.service.getAvailability(id);
      res.json({
        success: true,
        data: slots,
        message: 'Availability retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  setAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.user!.userId;
      const slots = await this.service.setAvailability(id, userId, req.body as AvailabilityInput);
      res.json({
        success: true,
        data: slots,
        message: 'Availability updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
