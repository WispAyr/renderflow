/**
 * @renderflow/ai - Cost Tracking Utilities
 */

import type { AIProviderType } from '@renderflow/core';
import type { CostInfo, UsageRecord, UsageSummary, GenerationRequest } from '../types.js';

// ============================================
// In-Memory Usage Store (replace with DB in production)
// ============================================

const usageStore: UsageRecord[] = [];

// ============================================
// Cost Estimation
// ============================================

/**
 * Provider pricing (USD)
 * Updated as of 2024 - verify with actual provider docs
 */
export const PROVIDER_PRICING: Record<AIProviderType, {
  image?: { perGeneration: number };
  video?: { perSecond: number };
}> = {
  grok: {
    image: { perGeneration: 0.04 },
  },
  dalle: {
    image: { perGeneration: 0.04 }, // DALL-E 3 standard 1024x1024
  },
  openai: {
    image: { perGeneration: 0.04 },
  },
  runway: {
    video: { perSecond: 0.05 }, // Gen-3 Turbo
    image: { perGeneration: 0.05 },
  },
  stability: {
    image: { perGeneration: 0.065 }, // SD3 Large
  },
  pika: {
    video: { perSecond: 0.05 },
  },
  midjourney: {
    image: { perGeneration: 0.02 }, // Basic plan rate
  },
};

/**
 * Estimate cost for a generation request
 */
export function estimateCost(
  provider: AIProviderType,
  request: GenerationRequest
): CostInfo {
  const pricing = PROVIDER_PRICING[provider];
  
  if (request.type === 'video' && pricing.video) {
    const duration = request.duration ?? 5;
    return {
      amount: duration * pricing.video.perSecond,
      currency: 'USD',
      unit: 'second',
      breakdown: {
        base: pricing.video.perSecond,
        duration: duration * pricing.video.perSecond,
      },
    };
  }
  
  if (request.type === 'image' && pricing.image) {
    let multiplier = 1;
    
    // Quality multiplier
    if (request.quality === 'high') multiplier *= 1.5;
    
    // Resolution multiplier for some providers
    if (request.width > 1024 || request.height > 1024) {
      multiplier *= 1.5;
    }
    
    return {
      amount: pricing.image.perGeneration * multiplier,
      currency: 'USD',
      unit: 'generation',
      breakdown: {
        base: pricing.image.perGeneration,
        quality: request.quality === 'high' ? pricing.image.perGeneration * 0.5 : 0,
        resolution: (request.width > 1024 || request.height > 1024) 
          ? pricing.image.perGeneration * 0.5 
          : 0,
      },
    };
  }
  
  return {
    amount: 0,
    currency: 'USD',
    unit: 'generation',
  };
}

// ============================================
// Usage Recording
// ============================================

/**
 * Record a generation request for tracking
 */
export function recordUsage(
  provider: AIProviderType,
  request: GenerationRequest,
  success: boolean,
  cost?: CostInfo,
  options?: { clientId?: string; jobId?: string }
): UsageRecord {
  const record: UsageRecord = {
    id: `usage_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    provider,
    timestamp: new Date(),
    request,
    response: { success },
    cost: cost ?? estimateCost(provider, request),
    clientId: options?.clientId,
    jobId: options?.jobId,
  };
  
  usageStore.push(record);
  
  // Keep only last 10000 records in memory
  while (usageStore.length > 10000) {
    usageStore.shift();
  }
  
  return record;
}

/**
 * Get usage records with optional filters
 */
export function getUsageRecords(filters?: {
  provider?: AIProviderType;
  clientId?: string;
  since?: Date;
  until?: Date;
  limit?: number;
}): UsageRecord[] {
  let records = [...usageStore];
  
  if (filters?.provider) {
    records = records.filter(r => r.provider === filters.provider);
  }
  
  if (filters?.clientId) {
    records = records.filter(r => r.clientId === filters.clientId);
  }
  
  if (filters?.since) {
    records = records.filter(r => r.timestamp >= filters.since!);
  }
  
  if (filters?.until) {
    records = records.filter(r => r.timestamp <= filters.until!);
  }
  
  // Sort by timestamp descending
  records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  if (filters?.limit) {
    records = records.slice(0, filters.limit);
  }
  
  return records;
}

// ============================================
// Usage Summaries
// ============================================

/**
 * Get usage summary for a provider
 */
export function getUsageSummary(
  provider: AIProviderType,
  period: { start: Date; end: Date }
): UsageSummary {
  const records = getUsageRecords({
    provider,
    since: period.start,
    until: period.end,
  });
  
  const successCount = records.filter(r => r.response.success).length;
  const totalCost = records.reduce((sum, r) => sum + (r.cost?.amount ?? 0), 0);
  
  const imageRecords = records.filter(r => r.request.type === 'image');
  const videoRecords = records.filter(r => r.request.type === 'video');
  
  const totalGenerationTime = records.reduce((sum, r) => 
    sum + (r.response.generationTimeMs ?? 0), 0
  );
  
  return {
    provider,
    period,
    totalCost,
    totalGenerations: records.length,
    successRate: records.length > 0 ? successCount / records.length : 0,
    averageGenerationTime: records.length > 0 
      ? totalGenerationTime / records.length 
      : 0,
    byType: {
      image: {
        count: imageRecords.length,
        cost: imageRecords.reduce((sum, r) => sum + (r.cost?.amount ?? 0), 0),
      },
      video: {
        count: videoRecords.length,
        cost: videoRecords.reduce((sum, r) => sum + (r.cost?.amount ?? 0), 0),
      },
    },
  };
}

/**
 * Get total spend across all providers for a period
 */
export function getTotalSpend(period: { start: Date; end: Date }): {
  total: number;
  currency: string;
  byProvider: Record<AIProviderType, number>;
} {
  const records = getUsageRecords({
    since: period.start,
    until: period.end,
  });
  
  const byProvider: Partial<Record<AIProviderType, number>> = {};
  
  for (const record of records) {
    const current = byProvider[record.provider] ?? 0;
    byProvider[record.provider] = current + (record.cost?.amount ?? 0);
  }
  
  return {
    total: records.reduce((sum, r) => sum + (r.cost?.amount ?? 0), 0),
    currency: 'USD',
    byProvider: byProvider as Record<AIProviderType, number>,
  };
}

// ============================================
// Budget Management
// ============================================

interface BudgetConfig {
  maxDailySpend?: number;
  maxMonthlySpend?: number;
  maxPerRequest?: number;
  warningThreshold?: number; // Percentage (0-1)
}

let budgetConfig: BudgetConfig = {
  maxDailySpend: 100,
  maxMonthlySpend: 2000,
  maxPerRequest: 5,
  warningThreshold: 0.8,
};

/**
 * Configure budget limits
 */
export function setBudgetConfig(config: Partial<BudgetConfig>): void {
  budgetConfig = { ...budgetConfig, ...config };
}

/**
 * Get current budget config
 */
export function getBudgetConfig(): BudgetConfig {
  return { ...budgetConfig };
}

/**
 * Check if a request is within budget
 */
export function checkBudget(estimatedCost: number): {
  allowed: boolean;
  reason?: string;
  remainingDaily?: number;
  remainingMonthly?: number;
} {
  const now = new Date();
  
  // Check per-request limit
  if (budgetConfig.maxPerRequest && estimatedCost > budgetConfig.maxPerRequest) {
    return {
      allowed: false,
      reason: `Request cost $${estimatedCost.toFixed(2)} exceeds per-request limit of $${budgetConfig.maxPerRequest}`,
    };
  }
  
  // Check daily limit
  if (budgetConfig.maxDailySpend) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daySpend = getTotalSpend({ start: dayStart, end: now }).total;
    const remainingDaily = budgetConfig.maxDailySpend - daySpend;
    
    if (daySpend + estimatedCost > budgetConfig.maxDailySpend) {
      return {
        allowed: false,
        reason: `Daily spend limit of $${budgetConfig.maxDailySpend} would be exceeded`,
        remainingDaily,
      };
    }
  }
  
  // Check monthly limit
  if (budgetConfig.maxMonthlySpend) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSpend = getTotalSpend({ start: monthStart, end: now }).total;
    const remainingMonthly = budgetConfig.maxMonthlySpend - monthSpend;
    
    if (monthSpend + estimatedCost > budgetConfig.maxMonthlySpend) {
      return {
        allowed: false,
        reason: `Monthly spend limit of $${budgetConfig.maxMonthlySpend} would be exceeded`,
        remainingMonthly,
      };
    }
  }
  
  // Calculate remaining budgets
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return {
    allowed: true,
    remainingDaily: budgetConfig.maxDailySpend 
      ? budgetConfig.maxDailySpend - getTotalSpend({ start: dayStart, end: now }).total
      : undefined,
    remainingMonthly: budgetConfig.maxMonthlySpend
      ? budgetConfig.maxMonthlySpend - getTotalSpend({ start: monthStart, end: now }).total
      : undefined,
  };
}

/**
 * Get budget status
 */
export function getBudgetStatus(): {
  dailySpent: number;
  dailyLimit?: number;
  dailyPercentUsed?: number;
  monthlySpent: number;
  monthlyLimit?: number;
  monthlyPercentUsed?: number;
  warnings: string[];
} {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const dailySpent = getTotalSpend({ start: dayStart, end: now }).total;
  const monthlySpent = getTotalSpend({ start: monthStart, end: now }).total;
  
  const warnings: string[] = [];
  
  const dailyPercentUsed = budgetConfig.maxDailySpend 
    ? dailySpent / budgetConfig.maxDailySpend 
    : undefined;
    
  const monthlyPercentUsed = budgetConfig.maxMonthlySpend
    ? monthlySpent / budgetConfig.maxMonthlySpend
    : undefined;
  
  if (dailyPercentUsed && budgetConfig.warningThreshold && dailyPercentUsed >= budgetConfig.warningThreshold) {
    warnings.push(`Daily budget ${(dailyPercentUsed * 100).toFixed(0)}% used`);
  }
  
  if (monthlyPercentUsed && budgetConfig.warningThreshold && monthlyPercentUsed >= budgetConfig.warningThreshold) {
    warnings.push(`Monthly budget ${(monthlyPercentUsed * 100).toFixed(0)}% used`);
  }
  
  return {
    dailySpent,
    dailyLimit: budgetConfig.maxDailySpend,
    dailyPercentUsed,
    monthlySpent,
    monthlyLimit: budgetConfig.maxMonthlySpend,
    monthlyPercentUsed,
    warnings,
  };
}

/**
 * Clear usage records (for testing)
 */
export function clearUsageRecords(): void {
  usageStore.length = 0;
}
