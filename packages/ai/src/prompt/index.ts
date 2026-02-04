/**
 * @renderflow/ai - Prompt Engineering Exports
 */

export {
  derivePromptFromContent,
  createSimplePrompt,
  enhancePrompt,
  getTemplate,
  getAvailableTemplates,
  type DeriveOptions,
  type DerivedPrompt,
} from './derive.js';

export {
  STYLE_PRESETS,
  MOOD_MAPPINGS,
  CATEGORY_MAPPINGS,
  getStylePreset,
  getMoodMapping,
  getCategoryMapping,
  getAvailableStyles,
  getAvailableMoods,
  getAvailableCategories,
} from './presets.js';
