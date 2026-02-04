import { Hono } from 'hono';
import { CreateContentSchema, UpdateContentSchema } from '@renderflow/core';
import * as contentService from '../services/content.js';

const app = new Hono();

// GET /api/content - List content items (optionally filtered by client)
app.get('/', async (c) => {
  const clientId = c.req.query('clientId');
  if (clientId) {
    const content = await contentService.getContentByClientId(clientId);
    return c.json({ success: true, data: content });
  }
  // If no clientId, return empty (or implement pagination across all)
  return c.json({ success: true, data: [], message: 'Provide clientId query parameter' });
});

// GET /api/content/:id - Get content item by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const content = await contentService.getContentById(id);
  return c.json({ success: true, data: content });
});

// POST /api/content - Create new content item
app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = CreateContentSchema.parse(body);
  const content = await contentService.createContent(validated);
  return c.json({ success: true, data: content }, 201);
});

// PATCH /api/content/:id - Update content item
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const validated = UpdateContentSchema.parse(body);
  const content = await contentService.updateContent(id, validated);
  return c.json({ success: true, data: content });
});

// DELETE /api/content/:id - Delete content item
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await contentService.deleteContent(id);
  return c.json({ success: true, message: 'Content deleted' });
});

export default app;
