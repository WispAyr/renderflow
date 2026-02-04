import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, playlists } from '../db/index.js';
import { notFound } from '../middleware/errors.js';
import type { Playlist, PlaylistItem } from '@renderflow/core';

export interface CreatePlaylistInput {
  clientId: string;
  name: string;
  description?: string;
  items: Array<{
    order: number;
    type: 'render' | 'video' | 'image' | 'url';
    source: string;
    duration?: number;
    startDate?: Date;
    endDate?: Date;
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
  }>;
  loop?: boolean;
  shuffle?: boolean;
  transitionType?: 'cut' | 'fade' | 'slide';
  transitionDuration?: number;
  screenIds?: string[];
}

export type UpdatePlaylistInput = Partial<Omit<CreatePlaylistInput, 'clientId'>>;

export async function getPlaylistsByClientId(clientId: string): Promise<Playlist[]> {
  const rows = await db.select()
    .from(playlists)
    .where(eq(playlists.clientId, clientId))
    .orderBy(desc(playlists.createdAt));
  return rows.map(mapRowToPlaylist);
}

export async function getPlaylistById(id: string): Promise<Playlist> {
  const rows = await db.select().from(playlists).where(eq(playlists.id, id));
  if (rows.length === 0) {
    throw notFound(`Playlist ${id} not found`);
  }
  return mapRowToPlaylist(rows[0]);
}

export async function createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
  // Add IDs to items
  const itemsWithIds = input.items.map(item => ({
    ...item,
    id: nanoid(12),
    startDate: item.startDate?.toISOString(),
    endDate: item.endDate?.toISOString(),
  }));

  const rows = await db.insert(playlists).values({
    clientId: input.clientId,
    name: input.name,
    description: input.description,
    items: itemsWithIds,
    loop: input.loop ?? true,
    shuffle: input.shuffle ?? false,
    transitionType: input.transitionType,
    transitionDuration: input.transitionDuration,
    screenIds: input.screenIds,
  }).returning();

  return mapRowToPlaylist(rows[0]);
}

export async function updatePlaylist(id: string, input: UpdatePlaylistInput): Promise<Playlist> {
  await getPlaylistById(id); // Ensure exists

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.loop !== undefined) updateData.loop = input.loop;
  if (input.shuffle !== undefined) updateData.shuffle = input.shuffle;
  if (input.transitionType !== undefined) updateData.transitionType = input.transitionType;
  if (input.transitionDuration !== undefined) updateData.transitionDuration = input.transitionDuration;
  if (input.screenIds !== undefined) updateData.screenIds = input.screenIds;
  
  if (input.items !== undefined) {
    updateData.items = input.items.map(item => ({
      ...item,
      id: nanoid(12),
      startDate: item.startDate?.toISOString(),
      endDate: item.endDate?.toISOString(),
    }));
  }

  const rows = await db.update(playlists)
    .set(updateData)
    .where(eq(playlists.id, id))
    .returning();

  return mapRowToPlaylist(rows[0]);
}

export async function addPlaylistItem(
  playlistId: string,
  item: Omit<PlaylistItem, 'id'>
): Promise<Playlist> {
  const playlist = await getPlaylistById(playlistId);
  
  const newItem = {
    id: nanoid(12),
    order: item.order,
    type: item.type,
    source: item.source,
    duration: item.duration,
    startDate: item.startDate?.toISOString(),
    endDate: item.endDate?.toISOString(),
    daysOfWeek: item.daysOfWeek,
    startTime: item.startTime,
    endTime: item.endTime,
  };

  // Convert existing items to db format
  const existingItems = playlist.items.map(i => ({
    id: i.id,
    order: i.order,
    type: i.type,
    source: i.source,
    duration: i.duration,
    startDate: i.startDate?.toISOString(),
    endDate: i.endDate?.toISOString(),
    daysOfWeek: i.daysOfWeek,
    startTime: i.startTime,
    endTime: i.endTime,
  }));

  const updatedItems = [...existingItems, newItem];

  const rows = await db.update(playlists)
    .set({ items: updatedItems, updatedAt: new Date() })
    .where(eq(playlists.id, playlistId))
    .returning();

  return mapRowToPlaylist(rows[0]);
}

export async function removePlaylistItem(playlistId: string, itemId: string): Promise<Playlist> {
  const playlist = await getPlaylistById(playlistId);
  
  const updatedItems = playlist.items
    .filter(i => i.id !== itemId)
    .map(i => ({
      id: i.id,
      order: i.order,
      type: i.type,
      source: i.source,
      duration: i.duration,
      startDate: i.startDate?.toISOString(),
      endDate: i.endDate?.toISOString(),
      daysOfWeek: i.daysOfWeek,
      startTime: i.startTime,
      endTime: i.endTime,
    }));

  const rows = await db.update(playlists)
    .set({ items: updatedItems, updatedAt: new Date() })
    .where(eq(playlists.id, playlistId))
    .returning();

  return mapRowToPlaylist(rows[0]);
}

export async function reorderPlaylistItems(
  playlistId: string,
  itemOrder: string[]
): Promise<Playlist> {
  const playlist = await getPlaylistById(playlistId);
  
  // Create a map for quick lookup
  const itemMap = new Map(playlist.items.map(i => [i.id, i]));
  
  // Reorder items based on the new order and convert to db format
  const reorderedItems = itemOrder
    .map((id, index) => {
      const item = itemMap.get(id);
      if (!item) return null;
      return {
        id: item.id,
        order: index,
        type: item.type,
        source: item.source,
        duration: item.duration,
        startDate: item.startDate?.toISOString(),
        endDate: item.endDate?.toISOString(),
        daysOfWeek: item.daysOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const rows = await db.update(playlists)
    .set({ items: reorderedItems, updatedAt: new Date() })
    .where(eq(playlists.id, playlistId))
    .returning();

  return mapRowToPlaylist(rows[0]);
}

export async function deletePlaylist(id: string): Promise<void> {
  await getPlaylistById(id); // Ensure exists
  await db.delete(playlists).where(eq(playlists.id, id));
}

function mapRowToPlaylist(row: typeof playlists.$inferSelect): Playlist {
  const items = (row.items || []).map(item => ({
    id: item.id,
    order: item.order,
    type: item.type as 'render' | 'video' | 'image' | 'url',
    source: item.source,
    duration: item.duration,
    startDate: item.startDate ? new Date(item.startDate) : undefined,
    endDate: item.endDate ? new Date(item.endDate) : undefined,
    daysOfWeek: item.daysOfWeek,
    startTime: item.startTime,
    endTime: item.endTime,
  }));

  return {
    id: row.id,
    clientId: row.clientId,
    name: row.name,
    description: row.description || undefined,
    items,
    loop: row.loop,
    shuffle: row.shuffle,
    transitionType: row.transitionType as 'cut' | 'fade' | 'slide' | undefined,
    transitionDuration: row.transitionDuration || undefined,
    screenIds: row.screenIds || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
