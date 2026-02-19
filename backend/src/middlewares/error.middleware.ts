import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '@/utils/appError';
import { isDevelopment } from '@/config/env';

interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
  errors?: Record<string, string>[];
  stack?: string;
}

function handlePrismaUniqueConstraint(err: any): AppError {
  const target = err.meta?.target as string[] | undefined;
  const fields = target ? target.join(', ') : 'field';
  return AppError.conflict(`Duplicate value for: ${fields}. Please use a different value.`);
}

function handlePrismaNotFound(): AppError {
  return AppError.notFound('The requested resource was not found.');
}

function handlePrismaValidation(err: any): AppError {
  return AppError.badRequest(`Database validation error: ${err.message}`);
}

function handleValidationError(err: any): AppError {
  const errors = Object.values(err.errors || {}).map((e: any) => e.message);
  return AppError.badRequest(`Validation failed: ${errors.join('. ')}`);
}

function handleJsonSyntaxError(): AppError {
  return AppError.badRequest('Invalid JSON in request body.');
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if ((err as any).code === 'P2002') {
    error = handlePrismaUniqueConstraint(err);
  } else if ((err as any).code === 'P2025') {
    error = handlePrismaNotFound();
  } else if ((err as any).code === 'P2000') {
    error = handlePrismaValidation(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err instanceof SyntaxError && (err as any).status === 400) {
    error = handleJsonSyntaxError();
  } else {
    console.error('Unexpected error:', err);
    error = AppError.internal('An unexpected error occurred.');
  }

  const response: ErrorResponse = {
    status: error.status,
    message: error.message,
  };

  if (isDevelopment) {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
}
