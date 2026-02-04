/**
 * @renderflow/ai
 * 
 * AI provider abstraction layer for RenderFlow
 * Supports multiple image and video generation providers with
 * unified interface, smart prompt derivation, and cost tracking.
 * 
 * @example Basic Usage - Single Provider
 * ```typescript
 * import { createOpenAIProvider, derivePromptFromContent } from '@renderflow/ai';
 * 
 * // Initialize provider
 * const dalle = createOpenAIProvider(process.env.OPENAI_API_KEY!);
 * 
 * // Derive prompt from content
 * const content = {
 *   title: 'La Traviata',
 *   category: 'opera',
 *   mood: 'dramatic',
 *   description: 'A tale of love and sacrifice',
 * };
 * 
 * const { prompt, negativePrompt } = derivePromptFromContent(content, {
 *   style: 'cinematic',
 * });
 * 
 * // Generate image
 * const result = await dalle.generate({
 *   type: 'image',
 *   prompt,
 *   negativePrompt,
 *   width: 1920,
 *   height: 1080,
 *   quality: 'high',
 * });
 * 
 * if (result.success) {
 *   console.log('Generated:', result.assetUrl);
 *   console.log('Cost:', result.cost?.amount);
 * }
 * ```
 * 
 * @example Multi-Provider Setup
 * ```typescript
 * import { createProviders, selectProvider } from '@renderflow/ai';
 * 
 * const providers = createProviders({
 *   dalle: { apiKey: process.env.OPENAI_API_KEY! },
 *   grok: { apiKey: process.env.XAI_API_KEY! },
 *   runway: { apiKey: process.env.RUNWAY_API_KEY! },
 *   stability: { apiKey: process.env.STABILITY_API_KEY! },
 * });
 * 
 * // Select best provider for video
 * const videoProvider = selectProvider([...providers.values()], { type: 'video', ... });
 * ```
 * 
 * @example Prompt Engineering
 * ```typescript
 * import {
 *   derivePromptFromContent,
 *   getStylePreset,
 *   getMoodMapping,
 *   STYLE_PRESETS,
 * } from '@renderflow/ai';
 * 
 * // Get available styles
 * console.log(Object.keys(STYLE_PRESETS));
 * // ['cinematic', 'editorial', 'vibrant', 'minimal', 'luxury', ...]
 * 
 * // Get style details
 * const cinematic = getStylePreset('cinematic');
 * console.log(cinematic.promptModifiers);
 * // ['cinematic lighting', 'film grain', 'dramatic composition', ...]
 * ```
 * 
 * @example Cost Tracking & Budgets
 * ```typescript
 * import {
 *   setBudgetConfig,
 *   checkBudget,
 *   getBudgetStatus,
 *   estimateCost,
 * } from '@renderflow/ai';
 * 
 * // Set budget limits
 * setBudgetConfig({
 *   maxDailySpend: 50,
 *   maxMonthlySpend: 1000,
 *   maxPerRequest: 2,
 * });
 * 
 * // Check before generation
 * const cost = estimateCost('dalle', { type: 'image', ... });
 * const budgetCheck = checkBudget(cost.amount);
 * 
 * if (!budgetCheck.allowed) {
 *   console.error(budgetCheck.reason);
 * }
 * 
 * // Get current status
 * const status = getBudgetStatus();
 * console.log(`Daily: $${status.dailySpent} / $${status.dailyLimit}`);
 * ```
 */

// Types
export * from './types.js';

// Providers
export {
  AIProvider,
  providerSupports,
  selectProvider,
  createProvider,
  createProviders,
  // Individual providers
  GrokProvider,
  createGrokProvider,
  OpenAIProvider,
  createOpenAIProvider,
  RunwayProvider,
  createRunwayProvider,
  StabilityProvider,
  createStabilityProvider,
  // Config types
  type GrokConfig,
  type OpenAIConfig,
  type RunwayConfig,
  type StabilityConfig,
} from './providers/index.js';

// Prompt Engineering
export {
  // Main functions
  derivePromptFromContent,
  createSimplePrompt,
  enhancePrompt,
  getTemplate,
  getAvailableTemplates,
  // Presets
  STYLE_PRESETS,
  MOOD_MAPPINGS,
  CATEGORY_MAPPINGS,
  getStylePreset,
  getMoodMapping,
  getCategoryMapping,
  getAvailableStyles,
  getAvailableMoods,
  getAvailableCategories,
  // Types
  type DeriveOptions,
  type DerivedPrompt,
} from './prompt/index.js';

// Cost Tracking
export {
  estimateCost,
  recordUsage,
  getUsageRecords,
  getUsageSummary,
  getTotalSpend,
  setBudgetConfig,
  getBudgetConfig,
  checkBudget,
  getBudgetStatus,
  clearUsageRecords,
  PROVIDER_PRICING,
} from './utils/index.js';
