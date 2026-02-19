import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/appError';

type ValidateSource = 'body' | 'query' | 'params';

// ─── validate ────────────────────────────────────────────
// Shared Zod validation middleware factory.
// Parses and coerces the specified request source through the schema.
// On success, replaces the source with the validated + coerced data.
// On failure, forwards a 400 AppError to the error middleware.
//
// Usage:
//   validate(MySchema)            → validates req.body (default)
//   validate(MySchema, 'query')   → validates req.query
//   validate(MySchema, 'params')  → validates req.params
//
// Note: req.query is a getter-only property on Node's IncomingMessage.
// Direct assignment throws at runtime in Express 5, so we use
// Object.defineProperty to replace the descriptor with a writable value.
export function validate(schema: z.ZodSchema, source: ValidateSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('. ');
      return next(AppError.badRequest(`Validation failed: ${message}`));
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
      });
    }

    next();
  };
}
