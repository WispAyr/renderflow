/**
 * @renderflow/ai - Abstract AI Provider Base Class
 */

import type { AIProviderType, AICapability } from '@renderflow/core';
import type {
  ProviderConfig,
  GenerationRequest,
  GenerationResponse,
  ProviderCapabilities,
  ProviderStatus,
  CostInfo,
  RateLimitConfig,
} from '../types.js';

/**
 * Abstract base class for all AI providers.
 * Handles common functionality like rate limiting, retries, and cost tracking.
 */
export abstract class AIProvider {
  protected config: ProviderConfig;
  protected requestQueue: Array<() => Promise<void>> = [];
  protected activeRequests = 0;
  protected requestTimestamps: number[] = [];
  
  abstract readonly providerType: AIProviderType;
  abstract readonly name: string;
  abstract readonly capabilities: AICapability[];
  
  constructor(config: ProviderConfig) {
    this.config = {
      timeout: 120000, // 2 minutes default
      maxRetries: 3,
      ...config,
    };
  }

  // ============================================
  // Abstract Methods - Must be implemented
  // ============================================

  /**
   * Generate an image or video asset
   */
  abstract generate(request: GenerationRequest): Promise<GenerationResponse>;

  /**
   * Get provider-specific capabilities
   */
  abstract getCapabilities(): ProviderCapabilities;

  /**
   * Calculate cost for a generation request
   */
  abstract estimateCost(request: GenerationRequest): CostInfo;

  /**
   * Check provider health/availability
   */
  abstract checkStatus(): Promise<ProviderStatus>;

  // ============================================
  // Shared Implementation
  // ============================================

  /**
   * Check if provider supports the requested generation type
   */
  supports(type: 'image' | 'video'): boolean {
    return this.capabilities.includes(type);
  }

  /**
   * Validate a generation request before processing
   */
  protected validateRequest(request: GenerationRequest): void {
    if (!this.supports(request.type)) {
      throw new Error(`Provider ${this.name} does not support ${request.type} generation`);
    }

    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required for generation');
    }

    const caps = this.getCapabilities();
    
    if (request.type === 'image' && caps.image) {
      if (request.width > caps.image.maxWidth || request.height > caps.image.maxHeight) {
        throw new Error(
          `Dimensions ${request.width}x${request.height} exceed maximum ` +
          `${caps.image.maxWidth}x${caps.image.maxHeight} for ${this.name}`
        );
      }
    }

    if (request.type === 'video' && caps.video) {
      if (request.duration && request.duration > caps.video.maxDuration) {
        throw new Error(
          `Duration ${request.duration}s exceeds maximum ${caps.video.maxDuration}s for ${this.name}`
        );
      }
    }
  }

  /**
   * Rate limiting - wait if necessary before making request
   */
  protected async waitForRateLimit(): Promise<void> {
    const rateLimit = this.config.rateLimit;
    if (!rateLimit) return;

    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > windowStart);
    
    // Check if we're at the limit
    if (this.requestTimestamps.length >= rateLimit.requestsPerMinute) {
      const oldestInWindow = Math.min(...this.requestTimestamps);
      const waitTime = oldestInWindow + 60000 - now;
      
      if (waitTime > 0) {
        console.log(`[${this.name}] Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Check concurrent requests
    if (rateLimit.concurrentRequests) {
      while (this.activeRequests >= rateLimit.concurrentRequests) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Record a request for rate limiting
   */
  protected recordRequest(): void {
    this.requestTimestamps.push(Date.now());
    this.activeRequests++;
  }

  /**
   * Mark request as complete
   */
  protected completeRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  /**
   * Execute with retry logic
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = this.config.maxRetries ?? 3
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on validation errors
        if (error instanceof Error && error.message.includes('validation')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30000);
          console.log(`[${this.name}] Attempt ${attempt} failed, retrying in ${backoffMs}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    throw lastError ?? new Error('Operation failed after retries');
  }

  /**
   * Create a base response object
   */
  protected createResponse(
    request: GenerationRequest,
    partial: Partial<GenerationResponse>
  ): GenerationResponse {
    return {
      success: false,
      provider: this.providerType,
      promptUsed: request.prompt,
      generationTimeMs: 0,
      ...partial,
    };
  }

  /**
   * Get rate limit configuration
   */
  getRateLimit(): RateLimitConfig | undefined {
    return this.config.rateLimit;
  }

  /**
   * Get current usage stats
   */
  getUsageStats(): { activeRequests: number; requestsInWindow: number } {
    const now = Date.now();
    const windowStart = now - 60000;
    const requestsInWindow = this.requestTimestamps.filter(ts => ts > windowStart).length;
    
    return {
      activeRequests: this.activeRequests,
      requestsInWindow,
    };
  }
}

/**
 * Type guard to check if a provider supports a specific capability
 */
export function providerSupports(
  provider: AIProvider,
  capability: AICapability
): boolean {
  return provider.capabilities.includes(capability);
}

/**
 * Select best provider for a request from available providers
 */
export function selectProvider(
  providers: AIProvider[],
  request: GenerationRequest
): AIProvider | undefined {
  const compatible = providers.filter(p => p.supports(request.type));
  
  if (compatible.length === 0) return undefined;
  
  // TODO: Add smarter selection based on cost, latency, quality
  return compatible[0];
}
