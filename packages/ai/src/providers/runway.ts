/**
 * @renderflow/ai - Runway Provider
 * Video generation via Runway's Gen-3 API
 */

import type { AICapability } from '@renderflow/core';
import { AIProvider } from './base.js';
import type {
  ProviderConfig,
  GenerationRequest,
  GenerationResponse,
  ProviderCapabilities,
  ProviderStatus,
  CostInfo,
} from '../types.js';

export interface RunwayConfig extends ProviderConfig {
  model?: 'gen3a_turbo' | 'gen3a';
}

interface RunwayTaskResponse {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  output?: string[];
  failure?: string;
  failureCode?: string;
}

export class RunwayProvider extends AIProvider {
  readonly providerType = 'runway' as const;
  readonly name = 'Runway Gen-3';
  readonly capabilities: AICapability[] = ['video', 'image', 'animate'];
  
  private model: string;
  private baseUrl: string;
  private pollInterval = 5000; // 5 seconds

  constructor(config: RunwayConfig) {
    super({
      ...config,
      timeout: config.timeout ?? 300000, // 5 minutes for video
      rateLimit: config.rateLimit ?? {
        requestsPerMinute: 10,
        concurrentRequests: 3,
      },
    });
    
    this.model = config.model ?? 'gen3a_turbo';
    this.baseUrl = config.baseUrl ?? 'https://api.dev.runwayml.com/v1';
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    this.validateRequest(request);
    
    const startTime = Date.now();
    
    return this.withRetry(async () => {
      await this.waitForRateLimit();
      this.recordRequest();
      
      try {
        // Start the generation task
        const taskId = await this.startTask(request);
        
        // Poll for completion
        const result = await this.pollTask(taskId, this.config.timeout ?? 300000);
        
        if (!result.output || result.output.length === 0) {
          throw new Error('No output URL in Runway response');
        }

        return this.createResponse(request, {
          success: true,
          assetUrl: result.output[0],
          generationTimeMs: Date.now() - startTime,
          cost: this.estimateCost(request),
        });
      } finally {
        this.completeRequest();
      }
    });
  }

  private async startTask(request: GenerationRequest): Promise<string> {
    const endpoint = request.type === 'video' 
      ? '/image_to_video' 
      : '/text_to_image';
    
    const body: Record<string, unknown> = {
      model: this.model,
    };

    if (request.type === 'video') {
      // For video, we need a reference image or generate from text
      if (request.referenceImage) {
        body.promptImage = request.referenceImage;
        body.promptText = request.prompt;
      } else {
        // Use prompt_image endpoint with text-based approach
        body.promptText = request.prompt;
      }
      body.duration = request.duration ?? 5;
      body.ratio = this.mapRatio(request.width, request.height);
    } else {
      body.prompt = request.prompt;
      body.width = request.width;
      body.height = request.height;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
      throw new Error(error.error ?? `Runway API error: ${response.status}`);
    }

    const data = await response.json() as { id: string };
    return data.id;
  }

  private async pollTask(taskId: string, timeout: number): Promise<RunwayTaskResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      });

      if (!response.ok) {
        throw new Error(`Runway polling error: ${response.status}`);
      }

      const task = await response.json() as RunwayTaskResponse;
      
      switch (task.status) {
        case 'SUCCEEDED':
          return task;
        case 'FAILED':
          throw new Error(task.failure ?? 'Runway generation failed');
        case 'PENDING':
        case 'RUNNING':
          await new Promise(resolve => setTimeout(resolve, this.pollInterval));
          break;
      }
    }
    
    throw new Error('Runway generation timed out');
  }

  private mapRatio(width: number, height: number): string {
    const ratio = width / height;
    if (ratio > 1.5) return '16:9';
    if (ratio < 0.67) return '9:16';
    return '1:1';
  }

  getCapabilities(): ProviderCapabilities {
    return {
      provider: 'runway',
      name: this.name,
      capabilities: this.capabilities,
      video: {
        maxDuration: 10,
        maxWidth: 1920,
        maxHeight: 1080,
        supportedFps: [24],
        formats: ['mp4'],
      },
      image: {
        maxWidth: 1920,
        maxHeight: 1080,
        supportedRatios: ['1:1', '16:9', '9:16'],
        formats: ['png', 'webp'],
      },
      pricing: {
        video: { perSecond: 0.05, currency: 'USD' },
        image: { perGeneration: 0.05, currency: 'USD' },
      },
      rateLimit: this.config.rateLimit ?? { requestsPerMinute: 10 },
    };
  }

  estimateCost(request: GenerationRequest): CostInfo {
    if (request.type === 'video') {
      const duration = request.duration ?? 5;
      const perSecond = this.model === 'gen3a_turbo' ? 0.05 : 0.10;
      
      return {
        amount: duration * perSecond,
        currency: 'USD',
        unit: 'second',
        breakdown: {
          base: perSecond,
          duration: duration * perSecond,
        },
      };
    }
    
    return {
      amount: 0.05,
      currency: 'USD',
      unit: 'generation',
    };
  }

  async checkStatus(): Promise<ProviderStatus> {
    const startTime = Date.now();
    
    try {
      // Check by hitting a lightweight endpoint
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
        signal: AbortSignal.timeout(10000),
      });

      return {
        provider: 'runway',
        available: response.ok || response.status === 404, // 404 is fine, means API is up
        latencyMs: Date.now() - startTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        provider: 'runway',
        available: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
}

/**
 * Create a Runway provider instance
 */
export function createRunwayProvider(apiKey: string, options?: Partial<RunwayConfig>): RunwayProvider {
  return new RunwayProvider({
    apiKey,
    ...options,
  });
}
