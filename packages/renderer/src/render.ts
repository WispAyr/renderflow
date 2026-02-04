// ============================================
// RenderFlow Render Service
// ============================================

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition, getCompositions } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DIMENSIONS, AspectRatio } from './theme';
import { COMPOSITIONS, CompositionId } from './compositions';

// ============================================
// Types
// ============================================

export type RenderStatus = 'queued' | 'bundling' | 'rendering' | 'encoding' | 'completed' | 'failed' | 'cancelled';

export interface RenderJobInput {
  compositionId: CompositionId;
  inputProps: Record<string, unknown>;
  format?: AspectRatio;
  duration?: number;
  fps?: number;
  quality?: 'draft' | 'standard' | 'high';
  outputPath?: string;
  outputFilename?: string;
}

export interface RenderJob extends RenderJobInput {
  id: string;
  status: RenderStatus;
  progress: number;
  error?: string;
  outputPath: string;
  thumbnailPath?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface RenderProgress {
  jobId: string;
  status: RenderStatus;
  progress: number;
  renderedFrames?: number;
  totalFrames?: number;
  encodedFrames?: number;
}

export type ProgressCallback = (progress: RenderProgress) => void;

// ============================================
// Configuration
// ============================================

export interface RenderServiceConfig {
  outputDir: string;
  entryPoint: string;
  concurrency?: number;
  chromiumOptions?: Record<string, unknown>;
}

const DEFAULT_CONFIG: RenderServiceConfig = {
  outputDir: './output',
  entryPoint: './src/index.ts',
  concurrency: 4,
};

// Quality presets
const QUALITY_PRESETS = {
  draft: { crf: 28, codec: 'h264' as const },
  standard: { crf: 20, codec: 'h264' as const },
  high: { crf: 15, codec: 'h264' as const },
};

// ============================================
// Render Queue
// ============================================

class RenderQueue {
  private jobs: Map<string, RenderJob> = new Map();
  private queue: string[] = [];
  private processing: Set<string> = new Set();
  private maxConcurrent: number = 2;
  private listeners: Map<string, ProgressCallback[]> = new Map();

  constructor(maxConcurrent: number = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  add(job: RenderJob): void {
    this.jobs.set(job.id, job);
    this.queue.push(job.id);
  }

  get(jobId: string): RenderJob | undefined {
    return this.jobs.get(jobId);
  }

  getAll(): RenderJob[] {
    return Array.from(this.jobs.values());
  }

  getPending(): RenderJob[] {
    return this.queue.map(id => this.jobs.get(id)!);
  }

  getProcessing(): RenderJob[] {
    return Array.from(this.processing).map(id => this.jobs.get(id)!);
  }

  canProcess(): boolean {
    return this.processing.size < this.maxConcurrent && this.queue.length > 0;
  }

  dequeue(): RenderJob | undefined {
    const jobId = this.queue.shift();
    if (!jobId) return undefined;
    
    this.processing.add(jobId);
    return this.jobs.get(jobId);
  }

  complete(jobId: string): void {
    this.processing.delete(jobId);
  }

  update(jobId: string, updates: Partial<RenderJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, updates);
      this.notifyProgress(job);
    }
  }

  subscribe(jobId: string, callback: ProgressCallback): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, []);
    }
    this.listeners.get(jobId)!.push(callback);
    
    return () => {
      const listeners = this.listeners.get(jobId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      }
    };
  }

  private notifyProgress(job: RenderJob): void {
    const listeners = this.listeners.get(job.id) || [];
    const progress: RenderProgress = {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
    };
    listeners.forEach(cb => cb(progress));
  }
}

// ============================================
// Render Service
// ============================================

export class RenderService {
  private config: RenderServiceConfig;
  private queue: RenderQueue;
  private bundlePromise: Promise<string> | null = null;
  private bundleLocation: string | null = null;
  private isProcessing: boolean = false;

  constructor(config: Partial<RenderServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.queue = new RenderQueue(this.config.concurrency || 2);
    
    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  // ============ Bundle Management ============

  private async getBundle(): Promise<string> {
    if (this.bundleLocation) return this.bundleLocation;
    if (this.bundlePromise) return this.bundlePromise;

    this.bundlePromise = bundle({
      entryPoint: path.resolve(this.config.entryPoint),
      webpackOverride: (config) => config,
    });

    this.bundleLocation = await this.bundlePromise;
    console.log(`📦 Bundle created at: ${this.bundleLocation}`);
    return this.bundleLocation;
  }

  async invalidateBundle(): Promise<void> {
    this.bundleLocation = null;
    this.bundlePromise = null;
  }

  // ============ Job Management ============

  async createJob(input: RenderJobInput): Promise<RenderJob> {
    const composition = COMPOSITIONS[input.compositionId];
    if (!composition) {
      throw new Error(`Unknown composition: ${input.compositionId}`);
    }

    const format = input.format || 'landscape';
    const dims = DIMENSIONS[format];
    const filename = input.outputFilename || `${input.compositionId}_${uuidv4().slice(0, 8)}.mp4`;
    const outputPath = input.outputPath 
      ? path.join(input.outputPath, filename)
      : path.join(this.config.outputDir, filename);

    const job: RenderJob = {
      ...input,
      id: uuidv4(),
      status: 'queued',
      progress: 0,
      outputPath,
      format,
      duration: input.duration || composition.defaultDuration,
      fps: input.fps || 30,
      quality: input.quality || 'standard',
      createdAt: new Date(),
    };

    this.queue.add(job);
    this.processQueue();

    return job;
  }

  getJob(jobId: string): RenderJob | undefined {
    return this.queue.get(jobId);
  }

  getJobs(): RenderJob[] {
    return this.queue.getAll();
  }

  subscribeToProgress(jobId: string, callback: ProgressCallback): () => void {
    return this.queue.subscribe(jobId, callback);
  }

  // ============ Queue Processing ============

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.canProcess()) {
        const job = this.queue.dequeue();
        if (!job) break;

        // Don't await - let multiple jobs process concurrently
        this.processJob(job).catch(err => {
          console.error(`Job ${job.id} failed:`, err);
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: RenderJob): Promise<void> {
    try {
      // Update status to bundling
      this.queue.update(job.id, { 
        status: 'bundling', 
        startedAt: new Date() 
      });

      // Get or create bundle
      const bundleLocation = await this.getBundle();

      // Update status to rendering
      this.queue.update(job.id, { status: 'rendering' });

      // Get composition
      const format = job.format || 'landscape';
      const dims = DIMENSIONS[format];
      const fps = job.fps || 30;
      const durationInFrames = (job.duration || 10) * fps;

      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: job.compositionId,
        inputProps: job.inputProps,
      });

      // Get quality settings
      const qualityPreset = QUALITY_PRESETS[job.quality || 'standard'];

      // Render
      await renderMedia({
        composition: {
          ...composition,
          width: dims.width,
          height: dims.height,
          fps,
          durationInFrames,
        },
        serveUrl: bundleLocation,
        codec: qualityPreset.codec,
        outputLocation: job.outputPath,
        inputProps: job.inputProps,
        crf: qualityPreset.crf,
        onProgress: ({ progress, renderedFrames, encodedFrames }) => {
          const status = encodedFrames > 0 ? 'encoding' : 'rendering';
          this.queue.update(job.id, { 
            status, 
            progress: Math.round(progress * 100),
          });
        },
      });

      // Generate thumbnail (first frame)
      const thumbnailPath = job.outputPath.replace(/\.mp4$/, '_thumb.jpg');
      try {
        await renderStill({
          composition: {
            ...composition,
            width: dims.width,
            height: dims.height,
            fps,
            durationInFrames,
          },
          serveUrl: bundleLocation,
          output: thumbnailPath,
          inputProps: job.inputProps,
          frame: Math.floor(durationInFrames / 4), // Quarter through
          imageFormat: 'jpeg',
          jpegQuality: 80,
        });
      } catch (err) {
        console.warn('Thumbnail generation failed:', err);
      }

      // Mark complete
      this.queue.update(job.id, {
        status: 'completed',
        progress: 100,
        thumbnailPath: fs.existsSync(thumbnailPath) ? thumbnailPath : undefined,
        completedAt: new Date(),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.queue.update(job.id, {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
      });
      throw error;
    } finally {
      this.queue.complete(job.id);
      // Check if more jobs to process
      this.processQueue();
    }
  }

  // ============ Direct Render (No Queue) ============

  async renderComposition(input: RenderJobInput): Promise<string> {
    const job = await this.createJob(input);
    
    return new Promise((resolve, reject) => {
      const unsubscribe = this.subscribeToProgress(job.id, (progress) => {
        if (progress.status === 'completed') {
          unsubscribe();
          resolve(this.getJob(job.id)!.outputPath);
        } else if (progress.status === 'failed') {
          unsubscribe();
          reject(new Error(this.getJob(job.id)?.error || 'Render failed'));
        }
      });
    });
  }

  // ============ Utilities ============

  async listCompositions(): Promise<typeof COMPOSITIONS> {
    return COMPOSITIONS;
  }

  async validateInputProps(compositionId: CompositionId, inputProps: Record<string, unknown>): Promise<boolean> {
    // Basic validation - could be extended with Zod schemas
    const composition = COMPOSITIONS[compositionId];
    if (!composition) return false;
    return true;
  }
}

// ============================================
// Convenience Functions
// ============================================

let defaultService: RenderService | null = null;

export function initRenderService(config?: Partial<RenderServiceConfig>): RenderService {
  defaultService = new RenderService(config);
  return defaultService;
}

export function getRenderService(): RenderService {
  if (!defaultService) {
    defaultService = new RenderService();
  }
  return defaultService;
}

export async function renderComposition(input: RenderJobInput): Promise<string> {
  return getRenderService().renderComposition(input);
}

export async function createRenderJob(input: RenderJobInput): Promise<RenderJob> {
  return getRenderService().createJob(input);
}

export function getJob(jobId: string): RenderJob | undefined {
  return getRenderService().getJob(jobId);
}

export function subscribeToJobProgress(jobId: string, callback: ProgressCallback): () => void {
  return getRenderService().subscribeToProgress(jobId, callback);
}
