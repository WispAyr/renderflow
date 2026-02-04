import { Hono } from 'hono';
import * as templateService from '../services/templates.js';
import type { TemplateCategory, ContentType } from '@renderflow/core';

const app = new Hono();

// GET /api/templates - List all templates with optional filters
app.get('/', async (c) => {
  const filters: templateService.TemplateFilters = {};
  
  const category = c.req.query('category');
  if (category) filters.category = category as TemplateCategory;
  
  const contentType = c.req.query('contentType');
  if (contentType) filters.contentType = contentType as ContentType;
  
  const format = c.req.query('format');
  if (format) filters.format = format as 'landscape' | 'portrait' | 'square';
  
  const search = c.req.query('search');
  if (search) filters.search = search;

  const templates = await templateService.getAllTemplates(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  return c.json({ success: true, data: templates });
});

// GET /api/templates/categories - List available template categories
app.get('/categories', async (c) => {
  const categories = [
    { id: 'promo', name: 'Promotions', description: 'Promotional content and offers' },
    { id: 'countdown', name: 'Countdowns', description: 'Event countdowns and timers' },
    { id: 'branding', name: 'Branding', description: 'Brand awareness and identity' },
    { id: 'menu', name: 'Menus', description: 'Food and drink menus' },
    { id: 'stats', name: 'Statistics', description: 'Data and statistics displays' },
    { id: 'alert', name: 'Alerts', description: 'Important announcements and alerts' },
    { id: 'social', name: 'Social', description: 'Social media style content' },
    { id: 'ambient', name: 'Ambient', description: 'Background and ambient content' },
  ];
  return c.json({ success: true, data: categories });
});

// GET /api/templates/category/:category - List templates by category
app.get('/category/:category', async (c) => {
  const category = c.req.param('category') as TemplateCategory;
  const templates = await templateService.getTemplatesByCategory(category);
  return c.json({ success: true, data: templates });
});

// GET /api/templates/:id - Get template details by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const template = await templateService.getTemplateById(id);
  return c.json({ success: true, data: template });
});

// POST /api/templates - Create new template (admin only)
app.post('/', async (c) => {
  const body = await c.req.json();
  const template = await templateService.createTemplate(body);
  return c.json({ success: true, data: template }, 201);
});

// PATCH /api/templates/:id - Update template
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const template = await templateService.updateTemplate(id, body);
  return c.json({ success: true, data: template });
});

// DELETE /api/templates/:id - Delete template
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await templateService.deleteTemplate(id);
  return c.json({ success: true, message: 'Template deleted' });
});

export default app;
