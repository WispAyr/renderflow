/**
 * @renderflow/ai - OpenAI DALL-E Provider
 * Image generation via OpenAI's DALL-E API
 */

import OpenAI from 'openai';
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

export interface OpenAIConfig extends ProviderConfig {
  model?: 'dall-e-3' | 'dall-e-2';
  organization?: string;
}

type DallESize = '1024x1024' | '1792x1024' | '1024x1792' | '256x256' | '512x512';

export class OpenAIProvider extends AIProvider {
  readonly providerType = 'dalle' as const;
  readonly name = 'OpenAI DALL-E';
  readonly capabilities: AICapability[] = ['image', 'edit'];
  
  private client: OpenAI;
  private model: 'dall-e-3' | 'dall-e-2';

  constructor(config: OpenAIConfig) {
    super({
      ...config,
      rateLimit: config.rateLimit ?? {
        requestsPerMinute: 50,
        concurrentRequests: 5,
      },
    });
    
    this.model = config.model ?? 'dall-e-3';
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      timeout: config.timeout ?? 120000,
      maxRetries: 0, // We handle retries ourselves
    });
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    this.validateRequest(request);
    
    if (request.type !== 'image') {
      return this.createResponse(request, {
        success: false,
        error: 'OpenAI DALL-E only supports image generation',
      });
    }

    const startTime = Date.now();
    
    return this.withRetry(async () => {
      await this.waitForRateLimit();
      this.recordRequest();
      
      try {
        const response = await this.client.images.generate({
          model: this.model,
          prompt: request.prompt,
          n: 1,
          size: this.mapSize(request.width, request.height),
          quality: request.quality === 'high' ? 'hd' : 'standard',
          style: request.style === 'natural' ? 'natural' : 'vivid',
          response_format: 'url',
        });

        const imageUrl = response.data?.[0]?.url;
        const revisedPrompt = response.data?.[0]?.revised_prompt;
        
        if (!imageUrl) {
          throw new Error('No image URL in OpenAI response');
        }

        return this.createResponse(request, {
          success: true,
          assetUrl: imageUrl,
          promptUsed: revisedPrompt ?? request.prompt,
          generationTimeMs: Date.now() - startTime,
          cost: this.estimateCost(request),
        });
      } finally {
        this.completeRequest();
      }
    });
  }

  private mapSize(width: number, height: number): DallESize {
    if (this.model === 'dall-e-2') {
      // DALL-E 2 sizes
      if (width <= 256 && height <= 256) return '256x256';
      if (width <= 512 && height <= 512) return '512x512';
      return '1024x1024';
    }
    
    // DALL-E 3 sizes
    const ratio = width / height;
    if (ratio > 1.3) return '1792x1024'; // Landscape
    if (ratio < 0.77) return '1024x1792'; // Portrait
    return '1024x1024'; // Square
  }

  getCapabilities(): ProviderCapabilities {
    const isDALLE3 = this.model === 'dall-e-3';
    
    return {
      provider: 'dalle',
      name: this.name,
      capabilities: this.capabilities,
      image: {
        maxWidth: isDALLE3 ? 1792 : 1024,
        maxHeight: isDALLE3 ? 1792 : 1024,
        supportedRatios: isDALLE3 ? ['1:1', '16:9', '9:16'] : ['1:1'],
        formats: ['png', 'webp'],
      },
      pricing: {
        image: { 
          perGeneration: isDALLE3 ? 0.04 : 0.02, 
          currency: 'USD' 
        },
      },
      rateLimit: this.config.rateLimit ?? { requestsPerMinute: 50 },
    };
  }

  estimateCost(request: GenerationRequest): CostInfo {
    const isDALLE3 = this.model === 'dall-e-3';
    const isHD = request.quality === 'high';
    const isLarge = request.width > 1024 || request.height > 1024;
    
    let baseCost: number;
    if (isDALLE3) {
      baseCost = isHD ? (isLarge ? 0.12 : 0.08) : (isLarge ? 0.08 : 0.04);
    } else {
      baseCost = request.width <= 256 ? 0.016 : request.width <= 512 ? 0.018 : 0.02;
    }
    
    return {
      amount: baseCost,
      currency: 'USD',
      unit: 'generation',
      breakdown: {
        base: isDALLE3 ? 0.04 : 0.02,
        quality: isHD && isDALLE3 ? 0.04 : 0,
        resolution: isLarge && isDALLE3 ? 0.04 : 0,
      },
    };
  }

  async checkStatus(): Promise<ProviderStatus> {
    const startTime = Date.now();
    
    try {
      // Just check if we can access models (lightweight call)
      await this.client.models.list();
      
      return {
        provider: 'dalle',
        available: true,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        provider: 'dalle',
        available: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
}

/**
 * Create an OpenAI DALL-E provider instance
 */
export function createOpenAIProvider(apiKey: string, options?: Partial<OpenAIConfig>): OpenAIProvider {
  return new OpenAIProvider({
    apiKey,
    ...options,
  });
}
