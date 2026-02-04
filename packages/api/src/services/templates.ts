import { eq, desc, ilike } from 'drizzle-orm';
import { db, templates } from '../db/index.js';
import { notFound } from '../middleware/errors.js';
import type { Template, TemplateCategory, ContentType, TemplateSlot } from '@renderflow/core';

export interface TemplateFilters {
  category?: TemplateCategory;
  contentType?: ContentType;
  format?: 'landscape' | 'portrait' | 'square';
  search?: string;
}

export async function getAllTemplates(filters?: TemplateFilters): Promise<Template[]> {
  let query = db.select().from(templates);

  // Note: Complex filtering would require building dynamic queries
  // For now, we fetch all and filter in memory for simplicity
  const rows = await query.orderBy(desc(templates.createdAt));
  
  let result = rows.map(mapRowToTemplate);

  // Apply filters
  if (filters) {
    if (filters.category) {
      result = result.filter(t => t.category === filters.category);
    }
    if (filters.contentType) {
      result = result.filter(t => t.contentTypes.includes(filters.contentType!));
    }
    if (filters.format) {
      result = result.filter(t => t.formats.includes(filters.format!));
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search)
      );
    }
  }

  return result;
}

export async function getTemplateById(id: string): Promise<Template> {
  const rows = await db.select().from(templates).where(eq(templates.id, id));
  if (rows.length === 0) {
    throw notFound(`Template ${id} not found`);
  }
  return mapRowToTemplate(rows[0]);
}

export async function getTemplatesByCategory(category: TemplateCategory): Promise<Template[]> {
  const rows = await db.select()
    .from(templates)
    .where(eq(templates.category, category))
    .orderBy(templates.name);
  return rows.map(mapRowToTemplate);
}

export async function createTemplate(input: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
  const rows = await db.insert(templates).values({
    name: input.name,
    description: input.description,
    category: input.category,
    contentTypes: input.contentTypes,
    formats: input.formats,
    durations: input.durations,
    defaultDuration: input.defaultDuration,
    compositionId: input.compositionId,
    slots: input.slots,
    previewImage: input.previewImage,
    previewVideo: input.previewVideo,
    tags: input.tags,
  }).returning();

  return mapRowToTemplate(rows[0]);
}

export async function updateTemplate(
  id: string, 
  input: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Template> {
  await getTemplateById(id); // Ensure exists

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  
  const fields = [
    'name', 'description', 'category', 'contentTypes', 'formats',
    'durations', 'defaultDuration', 'compositionId', 'slots',
    'previewImage', 'previewVideo', 'tags'
  ] as const;

  for (const field of fields) {
    if (input[field] !== undefined) {
      updateData[field] = input[field];
    }
  }

  const rows = await db.update(templates)
    .set(updateData)
    .where(eq(templates.id, id))
    .returning();

  return mapRowToTemplate(rows[0]);
}

export async function deleteTemplate(id: string): Promise<void> {
  await getTemplateById(id); // Ensure exists
  await db.delete(templates).where(eq(templates.id, id));
}

function mapRowToTemplate(row: typeof templates.$inferSelect): Template {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.category as TemplateCategory,
    contentTypes: row.contentTypes as ContentType[],
    formats: row.formats as ('landscape' | 'portrait' | 'square')[],
    durations: row.durations as number[],
    defaultDuration: row.defaultDuration,
    compositionId: row.compositionId,
    slots: row.slots as TemplateSlot[],
    previewImage: row.previewImage || undefined,
    previewVideo: row.previewVideo || undefined,
    tags: row.tags || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
