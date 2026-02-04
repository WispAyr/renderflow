import { Hono } from 'hono';
import { CreateClientSchema, UpdateClientSchema } from '@renderflow/core';
import * as clientService from '../services/clients.js';

const app = new Hono();

// GET /api/clients - List all clients
app.get('/', async (c) => {
  const clients = await clientService.getAllClients();
  return c.json({ success: true, data: clients });
});

// GET /api/clients/:id - Get client by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const client = await clientService.getClientById(id);
  return c.json({ success: true, data: client });
});

// GET /api/clients/slug/:slug - Get client by slug
app.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  const client = await clientService.getClientBySlug(slug);
  if (!client) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } }, 404);
  }
  return c.json({ success: true, data: client });
});

// POST /api/clients - Create new client
app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = CreateClientSchema.parse(body);
  const client = await clientService.createClient(validated);
  return c.json({ success: true, data: client }, 201);
});

// PATCH /api/clients/:id - Update client
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const validated = UpdateClientSchema.parse(body);
  const client = await clientService.updateClient(id, validated);
  return c.json({ success: true, data: client });
});

// DELETE /api/clients/:id - Delete client
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await clientService.deleteClient(id);
  return c.json({ success: true, message: 'Client deleted' });
});

export default app;
