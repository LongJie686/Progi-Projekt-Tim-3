import { Request, Response, NextFunction } from 'express';
import { QuizService } from './service';
import { CreateQuizInput, QuizFilterInput, SubmitAnswersInput } from './dto';

export class QuizController {
  private service: QuizService;

  constructor(service: QuizService) {
    this.service = service;
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.service.create(userId, req.body as CreateQuizInput);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Quiz created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizId = String(req.params.id);
      const result = await this.service.getById(quizId);
      res.json({
        success: true,
        data: result,
        message: 'Quiz retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as QuizFilterInput;
      const result = await this.service.list(filters);
      res.json({
        success: true,
        data: result,
        message: 'Quizzes retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  startAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.userId;
      const quizId = String(req.params.id);
      const result = await this.service.startAttempt(studentId, quizId);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Quiz attempt started',
      });
    } catch (error) {
      next(error);
    }
  };

  submitAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.userId;
      const quizId = String(req.params.id);
      const attemptId = String(req.params.attemptId);
      const result = await this.service.submitAttempt(
        studentId,
        quizId,
        attemptId,
        req.body as SubmitAnswersInput
      );
      res.json({
        success: true,
        data: result,
        message: 'Quiz submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.userId;
      const quizId = String(req.params.id);
      const attemptId = String(req.params.attemptId);
      const result = await this.service.getResult(studentId, quizId, attemptId);
      res.json({
        success: true,
        data: result,
        message: 'Quiz results retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
