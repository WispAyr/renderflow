import { eq, desc } from 'drizzle-orm';
import { db, aiGenerationJobs } from '../db/index.js';
import { notFound } from '../middleware/errors.js';
import type { AIGenerateRequest, AIGenerateResponse, AIProviderType } from '@renderflow/core';

export interface AIGenerationJob {
  id: string;
  clientId?: string;
  type: 'image' | 'video' | 'background';
  provider?: AIProviderType;
  prompt?: string;
  negativePrompt?: string;
  deriveFrom?: {
    title?: string;
    category?: string;
    mood?: string;
    style?: string;
    description?: string;
  };
  dimensions: { width: number; height: number };
  duration?: number;
  style?: string;
  quality?: 'draft' | 'standard' | 'high';
  status: string;
  progress: number;
  error?: string;
  assetPath?: string;
  assetUrl?: string;
  finalPrompt?: string;
  cost?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateAIJobInput extends AIGenerateRequest {
  clientId?: string;
}

export async function getAIJobs(clientId?: string): Promise<AIGenerationJob[]> {
  let rows = await db.select().from(aiGenerationJobs).orderBy(desc(aiGenerationJobs.createdAt));
  
  let result = rows.map(mapRowToAIJob);
  
  if (clientId) {
    result = result.filter(j => j.clientId === clientId);
  }

  return result;
}

export async function getAIJobById(id: string): Promise<AIGenerationJob> {
  const rows = await db.select().from(aiGenerationJobs).where(eq(aiGenerationJobs.id, id));
  if (rows.length === 0) {
    throw notFound(`AI generation job ${id} not found`);
  }
  return mapRowToAIJob(rows[0]);
}

export async function createAIJob(input: CreateAIJobInput): Promise<AIGenerationJob> {
  // Build the prompt from deriveFrom if not provided
  let finalPrompt = input.prompt;
  if (!finalPrompt && input.deriveFrom) {
    const parts: string[] = [];
    if (input.deriveFrom.style) parts.push(input.deriveFrom.style);
    if (input.deriveFrom.mood) parts.push(`${input.deriveFrom.mood} atmosphere`);
    if (input.deriveFrom.category) parts.push(`${input.deriveFrom.category} scene`);
    if (input.deriveFrom.title) parts.push(`featuring "${input.deriveFrom.title}"`);
    if (input.deriveFrom.description) parts.push(input.deriveFrom.description);
    finalPrompt = parts.join(', ');
  }

  const rows = await db.insert(aiGenerationJobs).values({
    clientId: input.clientId,
    type: input.type,
    provider: input.provider,
    prompt: input.prompt,
    negativePrompt: input.negativePrompt,
    deriveFrom: input.deriveFrom,
    dimensions: input.dimensions,
    duration: input.duration,
    style: input.style,
    quality: input.quality || 'standard',
    status: 'pending',
    progress: 0,
    finalPrompt,
  }).returning();

  // In a real implementation, you would queue this job for processing
  // by an AI worker service

  return mapRowToAIJob(rows[0]);
}

export async function updateAIJobStatus(
  id: string,
  status: string,
  updates?: {
    progress?: number;
    error?: string;
    assetPath?: string;
    assetUrl?: string;
    finalPrompt?: string;
    cost?: number;
    completedAt?: Date;
  }
): Promise<AIGenerationJob> {
  await getAIJobById(id); // Ensure exists

  const updateData: Record<string, unknown> = { status };
  
  if (updates) {
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.error !== undefined) updateData.error = updates.error;
    if (updates.assetPath !== undefined) updateData.assetPath = updates.assetPath;
    if (updates.assetUrl !== undefined) updateData.assetUrl = updates.assetUrl;
    if (updates.finalPrompt !== undefined) updateData.finalPrompt = updates.finalPrompt;
    if (updates.cost !== undefined) updateData.cost = updates.cost;
    if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt;
  }

  const rows = await db.update(aiGenerationJobs)
    .set(updateData)
    .where(eq(aiGenerationJobs.id, id))
    .returning();

  return mapRowToAIJob(rows[0]);
}

export async function completeAIJob(
  id: string,
  result: AIGenerateResponse
): Promise<AIGenerationJob> {
  return updateAIJobStatus(id, result.success ? 'completed' : 'failed', {
    assetPath: result.assetPath,
    assetUrl: result.assetUrl,
    finalPrompt: result.prompt,
    cost: result.cost,
    error: result.error,
    completedAt: new Date(),
    progress: 100,
  });
}

export async function deleteAIJob(id: string): Promise<void> {
  await getAIJobById(id); // Ensure exists
  await db.delete(aiGenerationJobs).where(eq(aiGenerationJobs.id, id));
}

function mapRowToAIJob(row: typeof aiGenerationJobs.$inferSelect): AIGenerationJob {
  return {
    id: row.id,
    clientId: row.clientId || undefined,
    type: row.type as 'image' | 'video' | 'background',
    provider: row.provider as AIProviderType | undefined,
    prompt: row.prompt || undefined,
    negativePrompt: row.negativePrompt || undefined,
    deriveFrom: row.deriveFrom || undefined,
    dimensions: row.dimensions as { width: number; height: number },
    duration: row.duration || undefined,
    style: row.style || undefined,
    quality: row.quality as 'draft' | 'standard' | 'high' | undefined,
    status: row.status,
    progress: row.progress,
    error: row.error || undefined,
    assetPath: row.assetPath || undefined,
    assetUrl: row.assetUrl || undefined,
    finalPrompt: row.finalPrompt || undefined,
    cost: row.cost || undefined,
    createdAt: row.createdAt,
    completedAt: row.completedAt || undefined,
  };
}
