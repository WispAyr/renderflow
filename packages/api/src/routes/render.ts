import { Hono } from 'hono';
import { CreateRenderJobSchema } from '@renderflow/core';
import * as renderService from '../services/render.js';
import type { RenderStatus } from '@renderflow/core';

const app = new Hono();

// GET /api/render - List render jobs with optional filters
app.get('/', async (c) => {
  const filters: renderService.RenderJobFilters = {};
  
  const clientId = c.req.query('clientId');
  if (clientId) filters.clientId = clientId;
  
  const status = c.req.query('status');
  if (status) filters.status = status as RenderStatus;
  
  const templateId = c.req.query('templateId');
  if (templateId) filters.templateId = templateId;

  const jobs = await renderService.getRenderJobs(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  return c.json({ success: true, data: jobs });
});

// GET /api/render/:id - Get render job status
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const job = await renderService.getRenderJobById(id);
  return c.json({ success: true, data: job });
});

// GET /api/render/:id/status - Get just the status (lightweight)
app.get('/:id/status', async (c) => {
  const id = c.req.param('id');
  const job = await renderService.getRenderJobById(id);
  return c.json({
    success: true,
    data: {
      id: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error,
      outputUrl: job.outputUrl,
    },
  });
});

// POST /api/render - Create new render job
app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = CreateRenderJobSchema.parse(body);
  const job = await renderService.createRenderJob(validated);
  return c.json({ success: true, data: job }, 201);
});

// POST /api/render/:id/cancel - Cancel a render job
app.post('/:id/cancel', async (c) => {
  const id = c.req.param('id');
  const job = await renderService.cancelRenderJob(id);
  return c.json({ success: true, data: job });
});

// PATCH /api/render/:id/status - Update render job status (internal use)
app.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { status, ...updates } = body;
  const job = await renderService.updateRenderJobStatus(id, status, updates);
  return c.json({ success: true, data: job });
});

// DELETE /api/render/:id - Delete render job
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await renderService.deleteRenderJob(id);
  return c.json({ success: true, message: 'Render job deleted' });
});

export default app;
