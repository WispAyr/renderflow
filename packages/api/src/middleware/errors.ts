import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { StatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';
import { logger } from './logger.js';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function notFound(message = 'Resource not found') {
  return new ApiError(404, message, 'NOT_FOUND');
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, message, 'BAD_REQUEST', details);
}

export function conflict(message: string) {
  return new ApiError(409, message, 'CONFLICT');
}

export function errorHandler() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (err: unknown) {
      const requestId = c.get('requestId') || 'unknown';
      const error = err as Error;

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        logger.warn({ requestId, errors: error.errors }, 'Validation error');
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map((e: { path: (string | number)[]; message: string }) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        }, 400 as StatusCode);
      }

      // Handle custom API errors
      if (error instanceof ApiError) {
        logger.warn({ requestId, code: error.code, message: error.message }, 'API error');
        return c.json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        }, error.statusCode as StatusCode);
      }

      // Handle Hono HTTP exceptions
      if (error instanceof HTTPException) {
        return c.json({
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: error.message,
          },
        }, error.status);
      }

      // Handle unexpected errors
      logger.error({ requestId, error }, 'Unexpected error');
      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      }, 500 as StatusCode);
    }
  };
}
