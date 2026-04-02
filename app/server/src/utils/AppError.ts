export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: Record<string, string[]>): AppError {
    return new AppError(400, message, true, details);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(401, message);
  }

  static forbidden(message = 'Insufficient permissions'): AppError {
    return new AppError(403, message);
  }

  static notFound(resource: string): AppError {
    return new AppError(404, `${resource} not found`);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static validation(message: string, details: Record<string, string[]>): AppError {
    return new AppError(422, message, true, details);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(500, message, false);
  }
}
