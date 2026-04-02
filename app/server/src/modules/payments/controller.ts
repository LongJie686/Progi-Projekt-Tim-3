import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './service';
import { CreatePaymentIntentInput, PaymentFilterInput } from './dto';

export class PaymentController {
  private service: PaymentService;

  constructor(service: PaymentService) {
    this.service = service;
  }

  createIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { bookingId } = req.body as CreatePaymentIntentInput;
      const result = await this.service.createIntent(userId, bookingId);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Payment intent created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  webhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Raw body is required for Stripe webhook signature verification
      const event = req.body;
      await this.service.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  history = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const filters = req.query as unknown as PaymentFilterInput;
      const result = await this.service.getHistory(userId, {
        status: filters.status,
        page: filters.page,
        limit: filters.limit,
      });
      res.json({
        success: true,
        data: result,
        message: 'Payment history retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  releaseEscrow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = await this.service.releaseEscrow(id);
      res.json({
        success: true,
        data: result,
        message: 'Escrow released successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
