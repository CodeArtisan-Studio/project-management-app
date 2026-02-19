import { StatusCodes, ReasonPhrases } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = ReasonPhrases.BAD_REQUEST): AppError {
    return new AppError(message, StatusCodes.BAD_REQUEST);
  }

  static unauthorized(message: string = ReasonPhrases.UNAUTHORIZED): AppError {
    return new AppError(message, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(message: string = ReasonPhrases.FORBIDDEN): AppError {
    return new AppError(message, StatusCodes.FORBIDDEN);
  }

  static notFound(message: string = ReasonPhrases.NOT_FOUND): AppError {
    return new AppError(message, StatusCodes.NOT_FOUND);
  }

  static conflict(message: string = ReasonPhrases.CONFLICT): AppError {
    return new AppError(message, StatusCodes.CONFLICT);
  }

  static unprocessable(message: string = ReasonPhrases.UNPROCESSABLE_ENTITY): AppError {
    return new AppError(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }

  static tooManyRequests(message: string = ReasonPhrases.TOO_MANY_REQUESTS): AppError {
    return new AppError(message, StatusCodes.TOO_MANY_REQUESTS);
  }

  static internal(message: string = ReasonPhrases.INTERNAL_SERVER_ERROR): AppError {
    return new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
