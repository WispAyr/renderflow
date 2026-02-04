/**
 * @renderflow/ai - Stability AI Provider
 * Image generation via Stability AI's API (Stable Diffusion)
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

export interface StabilityConfig extends ProviderConfig {
  model?: 'sd3-large' | 'sd3-large-turbo' | 'sd3-medium' | 'stable-image-ultra' | 'stable-image-core';
}

export class StabilityProvider extends AIProvider {
  readonly providerType = 'stability' as const;
  readonly name = 'Stability AI';
  readonly capabilities: AICapability[] = ['image', 'upscale', 'edit', 'inpaint'];
  
  private model: string;
  private baseUrl: string;

  constructor(config: StabilityConfig) {
    super({
      ...config,
      rateLimit: config.rateLimit ?? {
        requestsPerMinute: 30,
        concurrentRequests: 5,
      },
    });
    
    this.model = config.model ?? 'sd3-large';
    this.baseUrl = config.baseUrl ?? 'https://api.stability.ai/v2beta';
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    this.validateRequest(request);
    
    if (request.type !== 'image') {
      return this.createResponse(request, {
        success: false,
        error: 'Stability AI only supports image generation',
      });
    }

    const startTime = Date.now();
    
    return this.withRetry(async () => {
      await this.waitForRateLimit();
      this.recordRequest();
      
      try {
        const formData = new FormData();
        formData.append('prompt', request.prompt);
        
        if (request.negativePrompt) {
          formData.append('negative_prompt', request.negativePrompt);
        }
        
        formData.append('aspect_ratio', this.mapAspectRatio(request.width, request.height));
        formData.append('output_format', 'png');
        
        if (request.seed !== undefined) {
          formData.append('seed', request.seed.toString());
        }
        
        // Model-specific parameters
        if (this.model.startsWith('sd3')) {
          formData.append('model', this.model);
        }

        const endpoint = this.model.includes('ultra') 
          ? '/stable-image/generate/ultra'
          : this.model.includes('core')
          ? '/stable-image/generate/core'
          : '/stable-image/generate/sd3';

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/json',
          },
          body: formData,
          signal: AbortSignal.timeout(this.config.timeout ?? 120000),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
          throw new Error(error.message ?? `Stability AI error: ${response.status}`);
        }

        const data = await response.json() as { image?: string; seed?: number };
        
        // Response contains base64 encoded image
        const imageBase64 = data.image;
        if (!imageBase64) {
          throw new Error('No image in Stability AI response');
        }

        // Convert to data URL
        const imageUrl = `data:image/png;base64,${imageBase64}`;

        return this.createResponse(request, {
          success: true,
          assetUrl: imageUrl,
          seed: data.seed,
          generationTimeMs: Date.now() - startTime,
          cost: this.estimateCost(request),
        });
      } finally {
        this.completeRequest();
      }
    });
  }

  private mapAspectRatio(width: number, height: number): string {
    const ratio = width / height;
    
    // Stability supports specific aspect ratios
    if (ratio >= 1.7) return '16:9';
    if (ratio >= 1.4) return '3:2';
    if (ratio >= 1.2) return '4:3';
    if (ratio >= 0.9) return '1:1';
    if (ratio >= 0.7) return '3:4';
    if (ratio >= 0.5) return '2:3';
    return '9:16';
  }

  getCapabilities(): ProviderCapabilities {
    const modelTier = this.model.includes('ultra') ? 'ultra' 
      : this.model.includes('large') ? 'large' 
      : 'standard';
    
    return {
      provider: 'stability',
      name: this.name,
      capabilities: this.capabilities,
      image: {
        maxWidth: modelTier === 'ultra' ? 2048 : 1536,
        maxHeight: modelTier === 'ultra' ? 2048 : 1536,
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9', '9:21'],
        formats: ['png', 'jpeg', 'webp'],
      },
      pricing: {
        image: { 
          perGeneration: modelTier === 'ultra' ? 0.08 : modelTier === 'large' ? 0.065 : 0.03,
          currency: 'USD' 
        },
      },
      rateLimit: this.config.rateLimit ?? { requestsPerMinute: 30 },
    };
  }

  estimateCost(request: GenerationRequest): CostInfo {
    // Cost based on model tier
    let baseCost: number;
    
    if (this.model.includes('ultra')) {
      baseCost = 0.08;
    } else if (this.model.includes('large')) {
      baseCost = 0.065;
    } else if (this.model.includes('turbo')) {
      baseCost = 0.04;
    } else if (this.model.includes('core')) {
      baseCost = 0.03;
    } else {
      baseCost = 0.035; // SD3 medium
    }
    
    return {
      amount: baseCost,
      currency: 'USD',
      unit: 'generation',
    };
  }

  async checkStatus(): Promise<ProviderStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/user/account`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json() as { credits?: number };
        return {
          provider: 'stability',
          available: true,
          latencyMs: Date.now() - startTime,
          remainingQuota: data.credits,
          lastChecked: new Date(),
        };
      }

      return {
        provider: 'stability',
        available: false,
        latencyMs: Date.now() - startTime,
        errorMessage: `API returned ${response.status}`,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        provider: 'stability',
        available: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
}

/**
 * Create a Stability AI provider instance
 */
export function createStabilityProvider(apiKey: string, options?: Partial<StabilityConfig>): StabilityProvider {
  return new StabilityProvider({
    apiKey,
    ...options,
  });
}
