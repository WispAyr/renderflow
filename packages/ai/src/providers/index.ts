/**
 * @renderflow/ai - Provider Exports
 */

export { AIProvider, providerSupports, selectProvider } from './base.js';
export { GrokProvider, createGrokProvider, type GrokConfig } from './grok.js';
export { OpenAIProvider, createOpenAIProvider, type OpenAIConfig } from './openai.js';
export { RunwayProvider, createRunwayProvider, type RunwayConfig } from './runway.js';
export { StabilityProvider, createStabilityProvider, type StabilityConfig } from './stability.js';

import type { AIProviderType } from '@renderflow/core';
import type { ProviderConfig } from '../types.js';
import { GrokProvider } from './grok.js';
import { OpenAIProvider } from './openai.js';
import { RunwayProvider } from './runway.js';
import { StabilityProvider } from './stability.js';
import { AIProvider } from './base.js';

/**
 * Provider factory - create a provider by type
 */
export function createProvider(
  type: AIProviderType,
  config: ProviderConfig
): AIProvider {
  switch (type) {
    case 'grok':
      return new GrokProvider(config);
    case 'dalle':
    case 'openai':
      return new OpenAIProvider(config);
    case 'runway':
      return new RunwayProvider(config);
    case 'stability':
      return new StabilityProvider(config);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

/**
 * Create multiple providers from a config map
 */
export function createProviders(
  configs: Partial<Record<AIProviderType, ProviderConfig>>
): Map<AIProviderType, AIProvider> {
  const providers = new Map<AIProviderType, AIProvider>();
  
  for (const [type, config] of Object.entries(configs)) {
    if (config) {
      providers.set(type as AIProviderType, createProvider(type as AIProviderType, config));
    }
  }
  
  return providers;
}
