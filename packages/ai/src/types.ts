/**
 * @renderflow/ai - AI-specific Types
 */

import type { AIProviderType, AICapability, ContentItem } from '@renderflow/core';

// ============================================
// Provider Configuration
// ============================================

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimit?: RateLimitConfig;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute?: number;
  concurrentRequests?: number;
}

// ============================================
// Generation Request/Response
// ============================================

export interface GenerationRequest {
  type: 'image' | 'video';
  prompt: string;
  negativePrompt?: string;
  
  // Dimensions
  width: number;
  height: number;
  
  // Video-specific
  duration?: number;
  fps?: number;
  
  // Quality/style
  quality?: 'draft' | 'standard' | 'high';
  style?: string;
  
  // Advanced options
  seed?: number;
  steps?: number;
  guidanceScale?: number;
  
  // Reference images
  referenceImage?: string;
  referenceStrength?: number;
  
  // Content context for prompt derivation
  contentContext?: ContentContext;
}

export interface GenerationResponse {
  success: boolean;
  provider: AIProviderType;
  
  // Output
  assetPath?: string;
  assetUrl?: string;
  
  // Metadata
  promptUsed: string;
  seed?: number;
  
  // Cost tracking
  cost?: CostInfo;
  
  // Timing
  generationTimeMs: number;
  
  // Error handling
  error?: string;
  errorCode?: string;
}

// ============================================
// Content Context for Prompt Derivation
// ============================================

export interface ContentContext {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  tags?: string[];
  mood?: string;
  style?: string;
  venue?: string;
  date?: string;
  type?: string;
}

// ============================================
// Cost Tracking
// ============================================

export interface CostInfo {
  amount: number;
  currency: string;
  unit: 'image' | 'second' | 'token' | 'generation';
  breakdown?: CostBreakdown;
}

export interface CostBreakdown {
  base: number;
  quality?: number;
  resolution?: number;
  duration?: number;
}

export interface UsageRecord {
  id: string;
  provider: AIProviderType;
  timestamp: Date;
  request: GenerationRequest;
  response: Partial<GenerationResponse>;
  cost: CostInfo;
  clientId?: string;
  jobId?: string;
}

export interface UsageSummary {
  provider: AIProviderType;
  period: { start: Date; end: Date };
  totalCost: number;
  totalGenerations: number;
  successRate: number;
  averageGenerationTime: number;
  byType: {
    image: { count: number; cost: number };
    video: { count: number; cost: number };
  };
}

// ============================================
// Prompt Engineering
// ============================================

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category?: string;
  style?: string;
  mood?: string;
  negativePrompt?: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptModifiers: string[];
  negativePrompt?: string;
  parameters?: {
    guidanceScale?: number;
    steps?: number;
  };
}

export interface MoodMapping {
  mood: string;
  keywords: string[];
  colors?: string[];
  lighting?: string;
  atmosphere?: string;
}

export interface CategoryMapping {
  category: string;
  keywords: string[];
  suggestedStyles?: string[];
  suggestedMoods?: string[];
  visualElements?: string[];
}

// ============================================
// Provider Capabilities
// ============================================

export interface ProviderCapabilities {
  provider: AIProviderType;
  name: string;
  capabilities: AICapability[];
  
  // Image specs
  image?: {
    maxWidth: number;
    maxHeight: number;
    supportedRatios: string[];
    formats: string[];
  };
  
  // Video specs
  video?: {
    maxDuration: number;
    maxWidth: number;
    maxHeight: number;
    supportedFps: number[];
    formats: string[];
  };
  
  // Pricing
  pricing: {
    image?: { perGeneration: number; currency: string };
    video?: { perSecond: number; currency: string };
  };
  
  // Limits
  rateLimit: RateLimitConfig;
}

// ============================================
// Provider Status
// ============================================

export interface ProviderStatus {
  provider: AIProviderType;
  available: boolean;
  latencyMs?: number;
  remainingQuota?: number;
  errorMessage?: string;
  lastChecked: Date;
}
