import { eq, and, desc } from 'drizzle-orm';
import { db, contentItems } from '../db/index.js';
import { notFound } from '../middleware/errors.js';
import type { ContentItem, ContentType } from '@renderflow/core';

export interface CreateContentInput {
  clientId: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  images?: string[];
  video?: string;
  category?: string;
  tags?: string[];
  date?: string;
  dateEnd?: string;
  time?: string;
  timeEnd?: string;
  venue?: string;
  price?: string;
  priceRange?: { min: number; max: number; currency: string };
  ticketUrl?: string;
  accessibility?: string[];
  sku?: string;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
  nutritionFacts?: Record<string, string>;
  inStock?: boolean;
  featured?: boolean;
  value?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  change?: number;
  changePercent?: number;
  mood?: string;
  style?: string;
  aiPromptHint?: string;
  sortOrder?: number;
  active?: boolean;
  publishAt?: Date;
  expireAt?: Date;
}

export type UpdateContentInput = Partial<Omit<CreateContentInput, 'clientId'>>;

export async function getContentByClientId(clientId: string): Promise<ContentItem[]> {
  const rows = await db.select()
    .from(contentItems)
    .where(eq(contentItems.clientId, clientId))
    .orderBy(desc(contentItems.createdAt));
  return rows.map(mapRowToContent);
}

export async function getContentById(id: string): Promise<ContentItem> {
  const rows = await db.select().from(contentItems).where(eq(contentItems.id, id));
  if (rows.length === 0) {
    throw notFound(`Content item ${id} not found`);
  }
  return mapRowToContent(rows[0]);
}

export async function createContent(input: CreateContentInput): Promise<ContentItem> {
  const rows = await db.insert(contentItems).values({
    clientId: input.clientId,
    type: input.type,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    image: input.image,
    images: input.images,
    video: input.video,
    category: input.category,
    tags: input.tags,
    date: input.date,
    dateEnd: input.dateEnd,
    time: input.time,
    timeEnd: input.timeEnd,
    venue: input.venue,
    price: input.price,
    priceRange: input.priceRange,
    ticketUrl: input.ticketUrl,
    accessibility: input.accessibility,
    sku: input.sku,
    calories: input.calories,
    allergens: input.allergens,
    ingredients: input.ingredients,
    nutritionFacts: input.nutritionFacts,
    inStock: input.inStock,
    featured: input.featured,
    value: input.value,
    unit: input.unit,
    trend: input.trend,
    change: input.change,
    changePercent: input.changePercent,
    mood: input.mood,
    style: input.style,
    aiPromptHint: input.aiPromptHint,
    sortOrder: input.sortOrder,
    active: input.active ?? true,
    publishAt: input.publishAt,
    expireAt: input.expireAt,
  }).returning();

  return mapRowToContent(rows[0]);
}

export async function updateContent(id: string, input: UpdateContentInput): Promise<ContentItem> {
  await getContentById(id); // Ensure exists

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  
  // Copy all provided fields
  const fields = [
    'type', 'title', 'subtitle', 'description', 'image', 'images', 'video',
    'category', 'tags', 'date', 'dateEnd', 'time', 'timeEnd', 'venue',
    'price', 'priceRange', 'ticketUrl', 'accessibility', 'sku', 'calories',
    'allergens', 'ingredients', 'nutritionFacts', 'inStock', 'featured',
    'value', 'unit', 'trend', 'change', 'changePercent', 'mood', 'style',
    'aiPromptHint', 'sortOrder', 'active', 'publishAt', 'expireAt'
  ] as const;

  for (const field of fields) {
    if (input[field] !== undefined) {
      updateData[field] = input[field];
    }
  }

  const rows = await db.update(contentItems)
    .set(updateData)
    .where(eq(contentItems.id, id))
    .returning();

  return mapRowToContent(rows[0]);
}

export async function deleteContent(id: string): Promise<void> {
  await getContentById(id); // Ensure exists
  await db.delete(contentItems).where(eq(contentItems.id, id));
}

function mapRowToContent(row: typeof contentItems.$inferSelect): ContentItem {
  return {
    id: row.id,
    clientId: row.clientId,
    type: row.type as ContentType,
    title: row.title,
    subtitle: row.subtitle || undefined,
    description: row.description || undefined,
    image: row.image || undefined,
    images: row.images || undefined,
    video: row.video || undefined,
    category: row.category || undefined,
    tags: row.tags || undefined,
    date: row.date || undefined,
    dateEnd: row.dateEnd || undefined,
    time: row.time || undefined,
    timeEnd: row.timeEnd || undefined,
    venue: row.venue || undefined,
    price: row.price || undefined,
    priceRange: row.priceRange || undefined,
    ticketUrl: row.ticketUrl || undefined,
    accessibility: row.accessibility || undefined,
    sku: row.sku || undefined,
    calories: row.calories || undefined,
    allergens: row.allergens || undefined,
    ingredients: row.ingredients || undefined,
    nutritionFacts: row.nutritionFacts || undefined,
    inStock: row.inStock || undefined,
    featured: row.featured || undefined,
    value: row.value || undefined,
    unit: row.unit || undefined,
    trend: (row.trend as 'up' | 'down' | 'flat') || undefined,
    change: row.change || undefined,
    changePercent: row.changePercent || undefined,
    mood: row.mood || undefined,
    style: row.style || undefined,
    aiPromptHint: row.aiPromptHint || undefined,
    sortOrder: row.sortOrder || undefined,
    active: row.active || undefined,
    publishAt: row.publishAt || undefined,
    expireAt: row.expireAt || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
