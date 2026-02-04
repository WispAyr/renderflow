import { Hono } from 'hono';
import { CreatePlaylistSchema, UpdatePlaylistSchema } from '@renderflow/core';
import * as playlistService from '../services/playlists.js';

const app = new Hono();

// GET /api/playlists - List playlists (requires clientId)
app.get('/', async (c) => {
  const clientId = c.req.query('clientId');
  if (!clientId) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'clientId query parameter is required' },
    }, 400);
  }
  const playlists = await playlistService.getPlaylistsByClientId(clientId);
  return c.json({ success: true, data: playlists });
});

// GET /api/playlists/:id - Get playlist by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const playlist = await playlistService.getPlaylistById(id);
  return c.json({ success: true, data: playlist });
});

// POST /api/playlists - Create new playlist
app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = CreatePlaylistSchema.parse(body);
  const playlist = await playlistService.createPlaylist(validated);
  return c.json({ success: true, data: playlist }, 201);
});

// PATCH /api/playlists/:id - Update playlist
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const validated = UpdatePlaylistSchema.parse(body);
  const playlist = await playlistService.updatePlaylist(id, validated);
  return c.json({ success: true, data: playlist });
});

// POST /api/playlists/:id/items - Add item to playlist
app.post('/:id/items', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const playlist = await playlistService.addPlaylistItem(id, body);
  return c.json({ success: true, data: playlist });
});

// DELETE /api/playlists/:id/items/:itemId - Remove item from playlist
app.delete('/:id/items/:itemId', async (c) => {
  const id = c.req.param('id');
  const itemId = c.req.param('itemId');
  const playlist = await playlistService.removePlaylistItem(id, itemId);
  return c.json({ success: true, data: playlist });
});

// POST /api/playlists/:id/reorder - Reorder playlist items
app.post('/:id/reorder', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { itemOrder } = body;
  
  if (!Array.isArray(itemOrder)) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'itemOrder must be an array of item IDs' },
    }, 400);
  }

  const playlist = await playlistService.reorderPlaylistItems(id, itemOrder);
  return c.json({ success: true, data: playlist });
});

// DELETE /api/playlists/:id - Delete playlist
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await playlistService.deletePlaylist(id);
  return c.json({ success: true, message: 'Playlist deleted' });
});

export default app;
