/**
 * @renderflow/ai - Grok (xAI) Provider
 * Image generation via xAI's Grok API
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

export interface GrokConfig extends ProviderConfig {
  model?: 'grok-2-image' | 'grok-2-image-generation';
}

export class GrokProvider extends AIProvider {
  readonly providerType = 'grok' as const;
  readonly name = 'Grok (xAI)';
  readonly capabilities: AICapability[] = ['image'];
  
  private model: string;
  private baseUrl: string;

  constructor(config: GrokConfig) {
    super({
      ...config,
      rateLimit: config.rateLimit ?? {
        requestsPerMinute: 30,
        concurrentRequests: 5,
      },
    });
    
    this.model = config.model ?? 'grok-2-image';
    this.baseUrl = config.baseUrl ?? 'https://api.x.ai/v1';
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    this.validateRequest(request);
    
    if (request.type !== 'image') {
      return this.createResponse(request, {
        success: false,
        error: 'Grok only supports image generation',
      });
    }

    const startTime = Date.now();
    
    return this.withRetry(async () => {
      await this.waitForRateLimit();
      this.recordRequest();
      
      try {
        const response = await fetch(`${this.baseUrl}/images/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            prompt: request.prompt,
            n: 1,
            size: this.mapSize(request.width, request.height),
            response_format: 'url',
          }),
          signal: AbortSignal.timeout(this.config.timeout ?? 120000),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: response.statusText } })) as { error?: { message?: string } };
          throw new Error(error.error?.message ?? `Grok API error: ${response.status}`);
        }

        const data = await response.json() as { data?: Array<{ url?: string }> };
        const imageUrl = data.data?.[0]?.url;
        
        if (!imageUrl) {
          throw new Error('No image URL in Grok response');
        }

        return this.createResponse(request, {
          success: true,
          assetUrl: imageUrl,
          generationTimeMs: Date.now() - startTime,
          cost: this.estimateCost(request),
        });
      } finally {
        this.completeRequest();
      }
    });
  }

  private mapSize(width: number, height: number): string {
    // Grok supports specific sizes
    const ratio = width / height;
    
    if (ratio > 1.3) return '1792x1024'; // Landscape
    if (ratio < 0.77) return '1024x1792'; // Portrait
    return '1024x1024'; // Square
  }

  getCapabilities(): ProviderCapabilities {
    return {
      provider: 'grok',
      name: this.name,
      capabilities: this.capabilities,
      image: {
        maxWidth: 1792,
        maxHeight: 1792,
        supportedRatios: ['1:1', '16:9', '9:16'],
        formats: ['png', 'webp'],
      },
      pricing: {
        image: { perGeneration: 0.04, currency: 'USD' },
      },
      rateLimit: this.config.rateLimit ?? { requestsPerMinute: 30 },
    };
  }

  estimateCost(request: GenerationRequest): CostInfo {
    // Grok pricing is per generation
    const baseCost = 0.04;
    
    return {
      amount: baseCost,
      currency: 'USD',
      unit: 'generation',
    };
  }

  async checkStatus(): Promise<ProviderStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      return {
        provider: 'grok',
        available: response.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        provider: 'grok',
        available: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
}

/**
 * Create a Grok provider instance
 */
export function createGrokProvider(apiKey: string, options?: Partial<GrokConfig>): GrokProvider {
  return new GrokProvider({
    apiKey,
    ...options,
  });
}
