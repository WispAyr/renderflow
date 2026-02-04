import { Hono } from 'hono';
import { CreateScreenSchema, UpdateScreenSchema } from '@renderflow/core';
import * as screenService from '../services/screens.js';

const app = new Hono();

// GET /api/screens - List all screens (optionally filtered by client)
app.get('/', async (c) => {
  const clientId = c.req.query('clientId');
  const screens = await screenService.getAllScreens(clientId);
  return c.json({ success: true, data: screens });
});

// GET /api/screens/:id - Get screen by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const screen = await screenService.getScreenById(id);
  return c.json({ success: true, data: screen });
});

// POST /api/screens - Create new screen
app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = CreateScreenSchema.parse(body);
  const screen = await screenService.createScreen(validated);
  return c.json({ success: true, data: screen }, 201);
});

// PATCH /api/screens/:id - Update screen
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const validated = UpdateScreenSchema.parse(body);
  const screen = await screenService.updateScreen(id, validated);
  return c.json({ success: true, data: screen });
});

// POST /api/screens/:id/status - Update screen online status
app.post('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { online, currentContent } = body;
  const screen = await screenService.updateScreenStatus(id, online, currentContent);
  return c.json({ success: true, data: screen });
});

// POST /api/screens/:id/push - Push content to screen
app.post('/:id/push', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { type, source } = body;
  
  if (!type || !source) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'type and source are required' },
    }, 400);
  }

  const screen = await screenService.pushContentToScreen(id, { type, source });
  return c.json({ success: true, data: screen });
});

// DELETE /api/screens/:id - Delete screen
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await screenService.deleteScreen(id);
  return c.json({ success: true, message: 'Screen deleted' });
});

export default app;
