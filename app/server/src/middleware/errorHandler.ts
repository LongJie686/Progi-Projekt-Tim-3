import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { Prisma } from '../generated/prisma/client';

interface ErrorResponse {
  success: false;
  data: null;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string[]> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        message = `Duplicate value for: ${target}`;
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint failed';
        break;
      default:
        statusCode = 400;
        message = `Database error: ${err.message}`;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  const response: ErrorResponse = {
    success: false,
    data: null,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error', {
      statusCode,
      message: err.message,
      stack: err.stack,
    });
  } else {
    logger.warn('Client error', { statusCode, message });
  }

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl}`));
}
