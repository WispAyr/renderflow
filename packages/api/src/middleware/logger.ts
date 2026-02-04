import { Context, Next } from 'hono';
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});

export function loggerMiddleware() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const requestId = crypto.randomUUID().slice(0, 8);
    
    c.set('requestId', requestId);
    c.set('logger', logger.child({ requestId }));

    logger.info({
      requestId,
      method: c.req.method,
      path: c.req.path,
      query: c.req.query(),
    }, 'Request received');

    await next();

    const duration = Date.now() - start;
    logger.info({
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration: `${duration}ms`,
    }, 'Request completed');
  };
}
