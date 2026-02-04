import { eq } from 'drizzle-orm';
import { db, clients } from '../db/index.js';
import { notFound, conflict } from '../middleware/errors.js';
import type { Client, ClientBranding, ClientSettings } from '@renderflow/core';

export interface CreateClientInput {
  name: string;
  slug: string;
  branding: ClientBranding;
  settings?: ClientSettings;
}

export interface UpdateClientInput {
  name?: string;
  slug?: string;
  branding?: ClientBranding;
  settings?: ClientSettings;
}

export async function getAllClients(): Promise<Client[]> {
  const rows = await db.select().from(clients);
  return rows.map(mapRowToClient);
}

export async function getClientById(id: string): Promise<Client> {
  const rows = await db.select().from(clients).where(eq(clients.id, id));
  if (rows.length === 0) {
    throw notFound(`Client ${id} not found`);
  }
  return mapRowToClient(rows[0]);
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const rows = await db.select().from(clients).where(eq(clients.slug, slug));
  return rows.length > 0 ? mapRowToClient(rows[0]) : null;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  // Check for slug conflict
  const existing = await getClientBySlug(input.slug);
  if (existing) {
    throw conflict(`Client with slug "${input.slug}" already exists`);
  }

  const rows = await db.insert(clients).values({
    name: input.name,
    slug: input.slug,
    branding: input.branding,
    settings: input.settings || {},
  }).returning();

  return mapRowToClient(rows[0]);
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  // Ensure client exists
  await getClientById(id);

  // Check for slug conflict if updating slug
  if (input.slug) {
    const existing = await getClientBySlug(input.slug);
    if (existing && existing.id !== id) {
      throw conflict(`Client with slug "${input.slug}" already exists`);
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) updateData.name = input.name;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.branding !== undefined) updateData.branding = input.branding;
  if (input.settings !== undefined) updateData.settings = input.settings;

  const rows = await db.update(clients)
    .set(updateData)
    .where(eq(clients.id, id))
    .returning();

  return mapRowToClient(rows[0]);
}

export async function deleteClient(id: string): Promise<void> {
  await getClientById(id); // Ensure exists
  await db.delete(clients).where(eq(clients.id, id));
}

function mapRowToClient(row: typeof clients.$inferSelect): Client {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    branding: row.branding as ClientBranding,
    settings: (row.settings || {}) as ClientSettings,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
