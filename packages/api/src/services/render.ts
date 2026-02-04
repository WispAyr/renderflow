import { eq, desc, and } from 'drizzle-orm';
import { db, renderJobs } from '../db/index.js';
import { notFound } from '../middleware/errors.js';
import type { RenderJob, RenderStatus, OutputFormat, AIRenderOptions } from '@renderflow/core';

export interface CreateRenderJobInput {
  clientId: string;
  contentId?: string;
  contentIds?: string[];
  templateId: string;
  format: OutputFormat;
  duration: number;
  fps?: number;
  quality?: 'draft' | 'standard' | 'high';
  aiOptions?: AIRenderOptions;
  overrides?: Record<string, unknown>;
}

export interface RenderJobFilters {
  clientId?: string;
  status?: RenderStatus;
  templateId?: string;
}

export async function getRenderJobs(filters?: RenderJobFilters): Promise<RenderJob[]> {
  let rows = await db.select().from(renderJobs).orderBy(desc(renderJobs.createdAt));
  
  let result = rows.map(mapRowToRenderJob);

  if (filters) {
    if (filters.clientId) {
      result = result.filter(j => j.clientId === filters.clientId);
    }
    if (filters.status) {
      result = result.filter(j => j.status === filters.status);
    }
    if (filters.templateId) {
      result = result.filter(j => j.templateId === filters.templateId);
    }
  }

  return result;
}

export async function getRenderJobById(id: string): Promise<RenderJob> {
  const rows = await db.select().from(renderJobs).where(eq(renderJobs.id, id));
  if (rows.length === 0) {
    throw notFound(`Render job ${id} not found`);
  }
  return mapRowToRenderJob(rows[0]);
}

export async function createRenderJob(input: CreateRenderJobInput): Promise<RenderJob> {
  const rows = await db.insert(renderJobs).values({
    clientId: input.clientId,
    contentId: input.contentId,
    contentIds: input.contentIds,
    templateId: input.templateId,
    format: input.format,
    duration: input.duration,
    fps: input.fps || 30,
    quality: input.quality || 'standard',
    aiOptions: input.aiOptions,
    overrides: input.overrides,
    status: 'queued',
    progress: 0,
  }).returning();

  return mapRowToRenderJob(rows[0]);
}

export async function updateRenderJobStatus(
  id: string,
  status: RenderStatus,
  updates?: {
    progress?: number;
    error?: string;
    outputPath?: string;
    outputUrl?: string;
    thumbnailPath?: string;
    startedAt?: Date;
    completedAt?: Date;
  }
): Promise<RenderJob> {
  await getRenderJobById(id); // Ensure exists

  const updateData: Record<string, unknown> = { status };
  
  if (updates) {
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.error !== undefined) updateData.error = updates.error;
    if (updates.outputPath !== undefined) updateData.outputPath = updates.outputPath;
    if (updates.outputUrl !== undefined) updateData.outputUrl = updates.outputUrl;
    if (updates.thumbnailPath !== undefined) updateData.thumbnailPath = updates.thumbnailPath;
    if (updates.startedAt !== undefined) updateData.startedAt = updates.startedAt;
    if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt;
  }

  const rows = await db.update(renderJobs)
    .set(updateData)
    .where(eq(renderJobs.id, id))
    .returning();

  return mapRowToRenderJob(rows[0]);
}

export async function cancelRenderJob(id: string): Promise<RenderJob> {
  const job = await getRenderJobById(id);
  
  // Can only cancel queued or processing jobs
  if (!['queued', 'processing', 'rendering'].includes(job.status)) {
    throw new Error(`Cannot cancel job with status ${job.status}`);
  }

  return updateRenderJobStatus(id, 'cancelled');
}

export async function deleteRenderJob(id: string): Promise<void> {
  await getRenderJobById(id); // Ensure exists
  await db.delete(renderJobs).where(eq(renderJobs.id, id));
}

function mapRowToRenderJob(row: typeof renderJobs.$inferSelect): RenderJob {
  return {
    id: row.id,
    clientId: row.clientId,
    contentId: row.contentId || undefined,
    contentIds: row.contentIds || undefined,
    templateId: row.templateId,
    format: row.format as OutputFormat,
    duration: row.duration,
    fps: row.fps || undefined,
    quality: row.quality as 'draft' | 'standard' | 'high' | undefined,
    aiOptions: row.aiOptions as AIRenderOptions | undefined,
    overrides: row.overrides as Record<string, unknown> | undefined,
    status: row.status as RenderStatus,
    progress: row.progress,
    error: row.error || undefined,
    outputPath: row.outputPath || undefined,
    outputUrl: row.outputUrl || undefined,
    thumbnailPath: row.thumbnailPath || undefined,
    createdAt: row.createdAt,
    startedAt: row.startedAt || undefined,
    completedAt: row.completedAt || undefined,
  };
}
