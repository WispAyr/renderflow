import { eq, desc } from 'drizzle-orm';
import { db, screens } from '../db/index.js';
import { notFound } from '../middleware/errors.js';
import type { Screen } from '@renderflow/core';

export interface CreateScreenInput {
  clientId?: string;
  name: string;
  description?: string;
  location?: string;
  dimensions?: { width: number; height: number };
  orientation: 'landscape' | 'portrait';
  connectionType: 'websocket' | 'poll' | 'push';
  connectionUrl?: string;
  playlistId?: string;
}

export type UpdateScreenInput = Partial<CreateScreenInput>;

export async function getAllScreens(clientId?: string): Promise<Screen[]> {
  let rows = await db.select().from(screens).orderBy(desc(screens.createdAt));
  
  let result = rows.map(mapRowToScreen);
  
  if (clientId) {
    result = result.filter(s => s.clientId === clientId);
  }

  return result;
}

export async function getScreenById(id: string): Promise<Screen> {
  const rows = await db.select().from(screens).where(eq(screens.id, id));
  if (rows.length === 0) {
    throw notFound(`Screen ${id} not found`);
  }
  return mapRowToScreen(rows[0]);
}

export async function createScreen(input: CreateScreenInput): Promise<Screen> {
  const rows = await db.insert(screens).values({
    clientId: input.clientId,
    name: input.name,
    description: input.description,
    location: input.location,
    dimensions: input.dimensions,
    orientation: input.orientation,
    connectionType: input.connectionType,
    connectionUrl: input.connectionUrl,
    playlistId: input.playlistId,
    online: false,
  }).returning();

  return mapRowToScreen(rows[0]);
}

export async function updateScreen(id: string, input: UpdateScreenInput): Promise<Screen> {
  await getScreenById(id); // Ensure exists

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  
  const fields = [
    'clientId', 'name', 'description', 'location', 'dimensions',
    'orientation', 'connectionType', 'connectionUrl', 'playlistId'
  ] as const;

  for (const field of fields) {
    if (input[field] !== undefined) {
      updateData[field] = input[field];
    }
  }

  const rows = await db.update(screens)
    .set(updateData)
    .where(eq(screens.id, id))
    .returning();

  return mapRowToScreen(rows[0]);
}

export async function updateScreenStatus(
  id: string,
  online: boolean,
  currentContent?: { type: 'video' | 'playlist' | 'url'; source: string; startedAt: Date }
): Promise<Screen> {
  await getScreenById(id); // Ensure exists

  const updateData: Record<string, unknown> = {
    online,
    lastSeen: new Date(),
    updatedAt: new Date(),
  };

  if (currentContent) {
    updateData.currentContent = {
      ...currentContent,
      startedAt: currentContent.startedAt.toISOString(),
    };
  }

  const rows = await db.update(screens)
    .set(updateData)
    .where(eq(screens.id, id))
    .returning();

  return mapRowToScreen(rows[0]);
}

export async function pushContentToScreen(
  id: string,
  content: { type: 'video' | 'playlist' | 'url'; source: string }
): Promise<Screen> {
  const screen = await getScreenById(id);

  // Update current content
  const updatedScreen = await updateScreenStatus(id, screen.online, {
    ...content,
    startedAt: new Date(),
  });

  // In a real implementation, you would push to the screen via WebSocket/etc
  // For now, we just update the database state

  return updatedScreen;
}

export async function deleteScreen(id: string): Promise<void> {
  await getScreenById(id); // Ensure exists
  await db.delete(screens).where(eq(screens.id, id));
}

function mapRowToScreen(row: typeof screens.$inferSelect): Screen {
  return {
    id: row.id,
    clientId: row.clientId || undefined,
    name: row.name,
    description: row.description || undefined,
    location: row.location || undefined,
    dimensions: row.dimensions || undefined,
    orientation: row.orientation as 'landscape' | 'portrait',
    connectionType: row.connectionType as 'websocket' | 'poll' | 'push',
    connectionUrl: row.connectionUrl || undefined,
    lastSeen: row.lastSeen || undefined,
    online: row.online,
    currentContent: row.currentContent ? {
      type: row.currentContent.type,
      source: row.currentContent.source,
      startedAt: new Date(row.currentContent.startedAt),
    } : undefined,
    playlistId: row.playlistId || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
