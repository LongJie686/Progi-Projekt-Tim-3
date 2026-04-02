import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[target]);
      req[target] = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const field = err.path.join('.');
          if (!details[field]) details[field] = [];
          details[field].push(err.message);
        });
        next(AppError.validation('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}
