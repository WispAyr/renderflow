import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';

import { loggerMiddleware, errorHandler, logger } from './middleware/index.js';
import {
  clientsRouter,
  contentRouter,
  templatesRouter,
  renderRouter,
  screensRouter,
  playlistsRouter,
  aiRouter,
} from './routes/index.js';

// Create app
const app = new Hono();

// Global middleware
app.use('*', secureHeaders());
app.use('*', timing());
app.use('*', cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposeHeaders: ['X-Request-ID', 'Server-Timing'],
  maxAge: 3600,
  credentials: true,
}));
app.use('*', loggerMiddleware());
app.use('*', errorHandler());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

// API info
app.get('/api', (c) => {
  return c.json({
    name: 'RenderFlow API',
    version: '0.1.0',
    description: 'Content-to-Screen Platform with AI Enhancement',
    endpoints: {
      clients: '/api/clients',
      content: '/api/content',
      templates: '/api/templates',
      render: '/api/render',
      screens: '/api/screens',
      playlists: '/api/playlists',
      ai: '/api/ai/generate',
    },
  });
});

// Mount routers
app.route('/api/clients', clientsRouter);
app.route('/api/content', contentRouter);
app.route('/api/templates', templatesRouter);
app.route('/api/render', renderRouter);
app.route('/api/screens', screensRouter);
app.route('/api/playlists', playlistsRouter);
app.route('/api/ai/generate', aiRouter);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
  }, 404);
});

// Start server
const port = parseInt(process.env.PORT || '3600', 10);

logger.info(`Starting RenderFlow API server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  logger.info(`🚀 RenderFlow API running at http://localhost:${info.port}`);
  logger.info('Available endpoints:');
  logger.info('  GET  /health             - Health check');
  logger.info('  GET  /api                - API info');
  logger.info('  *    /api/clients        - Client management');
  logger.info('  *    /api/content        - Content items');
  logger.info('  *    /api/templates      - Template library');
  logger.info('  *    /api/render         - Render jobs');
  logger.info('  *    /api/screens        - Screen management');
  logger.info('  *    /api/playlists      - Playlist management');
  logger.info('  *    /api/ai/generate    - AI asset generation');
});

export default app;
