import { Hono } from 'hono';
import { AIGenerateRequestSchema } from '@renderflow/core';
import * as aiService from '../services/ai.js';

const app = new Hono();

// GET /api/ai/generate - List AI generation jobs (optionally filtered by client)
app.get('/', async (c) => {
  const clientId = c.req.query('clientId');
  const jobs = await aiService.getAIJobs(clientId);
  return c.json({ success: true, data: jobs });
});

// GET /api/ai/generate/:id - Get AI job status
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const job = await aiService.getAIJobById(id);
  return c.json({ success: true, data: job });
});

// GET /api/ai/generate/:id/status - Get just the status (lightweight)
app.get('/:id/status', async (c) => {
  const id = c.req.param('id');
  const job = await aiService.getAIJobById(id);
  return c.json({
    success: true,
    data: {
      id: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error,
      assetUrl: job.assetUrl,
    },
  });
});

// POST /api/ai/generate - Trigger AI asset generation
app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = AIGenerateRequestSchema.parse(body);
  
  // Extract clientId if provided (not in the schema but useful)
  const clientId = body.clientId;
  
  const job = await aiService.createAIJob({
    ...validated,
    clientId,
  });

  return c.json({ success: true, data: job }, 201);
});

// POST /api/ai/generate/:id/complete - Mark job as complete (internal/webhook)
app.post('/:id/complete', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const job = await aiService.completeAIJob(id, body);
  return c.json({ success: true, data: job });
});

// PATCH /api/ai/generate/:id/status - Update job status (internal)
app.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { status, ...updates } = body;
  const job = await aiService.updateAIJobStatus(id, status, updates);
  return c.json({ success: true, data: job });
});

// DELETE /api/ai/generate/:id - Delete AI job
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await aiService.deleteAIJob(id);
  return c.json({ success: true, message: 'AI job deleted' });
});

// GET /api/ai/providers - List available AI providers
app.get('/providers', async (c) => {
  const providers = [
    { id: 'grok', name: 'Grok', capabilities: ['image'], description: 'xAI Grok image generation' },
    { id: 'dalle', name: 'DALL-E', capabilities: ['image'], description: 'OpenAI DALL-E image generation' },
    { id: 'openai', name: 'OpenAI', capabilities: ['image'], description: 'OpenAI GPT-4V image generation' },
    { id: 'stability', name: 'Stability AI', capabilities: ['image', 'video'], description: 'Stable Diffusion models' },
    { id: 'runway', name: 'Runway', capabilities: ['video', 'image'], description: 'Runway ML video generation' },
    { id: 'pika', name: 'Pika', capabilities: ['video'], description: 'Pika Labs video generation' },
    { id: 'midjourney', name: 'Midjourney', capabilities: ['image'], description: 'Midjourney image generation' },
  ];
  return c.json({ success: true, data: providers });
});

export default app;
