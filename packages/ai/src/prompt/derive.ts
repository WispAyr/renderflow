/**
 * @renderflow/ai - Prompt Derivation
 * Smart prompt generation from content metadata
 */

import type { ContentItem } from '@renderflow/core';
import type { ContentContext, PromptTemplate, StylePreset, MoodMapping, CategoryMapping } from '../types.js';
import {
  getStylePreset,
  getMoodMapping,
  getCategoryMapping,
  STYLE_PRESETS,
  MOOD_MAPPINGS,
} from './presets.js';

// ============================================
// Prompt Templates
// ============================================

const DEFAULT_TEMPLATES: Record<string, PromptTemplate> = {
  eventBanner: {
    id: 'eventBanner',
    name: 'Event Banner',
    template: 'A stunning promotional image for {{title}}, {{categoryContext}}, {{moodContext}}, {{styleModifiers}}, professional marketing material, high quality',
    variables: ['title', 'categoryContext', 'moodContext', 'styleModifiers'],
  },
  
  productShowcase: {
    id: 'productShowcase',
    name: 'Product Showcase',
    template: '{{title}}, product photography, {{categoryContext}}, {{styleModifiers}}, studio lighting, commercial quality, isolated subject',
    variables: ['title', 'categoryContext', 'styleModifiers'],
  },
  
  backgroundAmbient: {
    id: 'backgroundAmbient',
    name: 'Ambient Background',
    template: 'Abstract {{moodContext}} background, {{categoryContext}}, {{styleModifiers}}, seamless, subtle movement, loopable',
    variables: ['moodContext', 'categoryContext', 'styleModifiers'],
  },
  
  socialPost: {
    id: 'socialPost',
    name: 'Social Media Post',
    template: '{{title}}, {{description}}, {{moodContext}}, eye-catching, scroll-stopping, {{styleModifiers}}, social media ready',
    variables: ['title', 'description', 'moodContext', 'styleModifiers'],
  },
  
  venueAtmosphere: {
    id: 'venueAtmosphere',
    name: 'Venue Atmosphere',
    template: '{{venue}} interior, {{categoryContext}}, {{moodContext}} atmosphere, architectural photography, {{styleModifiers}}',
    variables: ['venue', 'categoryContext', 'moodContext', 'styleModifiers'],
  },
};

// ============================================
// Main Derivation Function
// ============================================

export interface DeriveOptions {
  template?: string | PromptTemplate;
  style?: string;
  mood?: string;
  additionalModifiers?: string[];
  maxLength?: number;
  includeNegative?: boolean;
}

export interface DerivedPrompt {
  prompt: string;
  negativePrompt?: string;
  detectedMood?: string;
  detectedCategory?: string;
  styleApplied?: string;
  confidence: number;
}

/**
 * Derive a generation prompt from content metadata
 */
export function derivePromptFromContent(
  content: ContentItem | ContentContext,
  options: DeriveOptions = {}
): DerivedPrompt {
  const context = normalizeContext(content);
  
  // Detect category and mood if not provided
  const detectedCategory = context.category ? detectCategory(context.category) : undefined;
  const detectedMood = options.mood ?? context.mood ?? detectMoodFromContext(context, detectedCategory);
  
  // Get mappings
  const categoryMapping = detectedCategory ? getCategoryMapping(detectedCategory) : undefined;
  const moodMapping = detectedMood ? getMoodMapping(detectedMood) : undefined;
  const stylePreset = options.style ? getStylePreset(options.style) : 
    (categoryMapping?.suggestedStyles?.[0] ? getStylePreset(categoryMapping.suggestedStyles[0]) : undefined);
  
  // Build context strings
  const categoryContext = buildCategoryContext(categoryMapping, context);
  const moodContext = buildMoodContext(moodMapping);
  const styleModifiers = buildStyleModifiers(stylePreset, options.additionalModifiers);
  
  // Get or build template
  const template = resolveTemplate(options.template, context);
  
  // Fill template
  let prompt = fillTemplate(template.template, {
    title: context.title ?? 'untitled',
    subtitle: context.subtitle ?? '',
    description: context.description ?? '',
    category: context.category ?? '',
    venue: context.venue ?? 'venue',
    date: context.date ?? '',
    categoryContext,
    moodContext,
    styleModifiers,
    tags: context.tags?.join(', ') ?? '',
  });
  
  // Clean up and limit length
  prompt = cleanPrompt(prompt, options.maxLength ?? 1000);
  
  // Build negative prompt
  let negativePrompt: string | undefined;
  if (options.includeNegative !== false) {
    negativePrompt = buildNegativePrompt(stylePreset, moodMapping);
  }
  
  // Calculate confidence based on how much context we had
  const confidence = calculateConfidence(context, categoryMapping, moodMapping);
  
  return {
    prompt,
    negativePrompt,
    detectedMood,
    detectedCategory: categoryMapping?.category,
    styleApplied: stylePreset?.id,
    confidence,
  };
}

// ============================================
// Helper Functions
// ============================================

function normalizeContext(content: ContentItem | ContentContext): ContentContext {
  return {
    title: content.title,
    subtitle: 'subtitle' in content ? content.subtitle : undefined,
    description: content.description,
    category: content.category,
    tags: content.tags,
    mood: content.mood,
    style: content.style,
    venue: 'venue' in content ? content.venue : undefined,
    date: 'date' in content ? content.date : undefined,
    type: 'type' in content ? content.type : undefined,
  };
}

function detectCategory(input: string): string | undefined {
  const normalized = input.toLowerCase();
  
  // Direct mapping keys
  const categories = [
    'opera', 'concert', 'theatre', 'comedy',
    'restaurant', 'cafe', 'bar',
    'fashion', 'electronics',
    'sports', 'fitness',
    'wedding', 'corporate',
    'hotel', 'travel',
  ];
  
  for (const cat of categories) {
    if (normalized.includes(cat)) {
      return cat;
    }
  }
  
  // Fuzzy matching
  if (normalized.includes('music') || normalized.includes('gig')) return 'concert';
  if (normalized.includes('play') || normalized.includes('drama')) return 'theatre';
  if (normalized.includes('food') || normalized.includes('dining')) return 'restaurant';
  if (normalized.includes('drink') || normalized.includes('cocktail')) return 'bar';
  if (normalized.includes('cloth') || normalized.includes('apparel')) return 'fashion';
  if (normalized.includes('tech') || normalized.includes('gadget')) return 'electronics';
  if (normalized.includes('gym') || normalized.includes('workout')) return 'fitness';
  if (normalized.includes('conference') || normalized.includes('business')) return 'corporate';
  
  return undefined;
}

function detectMoodFromContext(context: ContentContext, category?: string): string | undefined {
  const categoryMapping = category ? getCategoryMapping(category) : undefined;
  
  // Use category's suggested mood
  if (categoryMapping?.suggestedMoods?.[0]) {
    return categoryMapping.suggestedMoods[0];
  }
  
  // Detect from description/title
  const text = [context.title, context.description].filter(Boolean).join(' ').toLowerCase();
  
  const moodKeywords: Record<string, string[]> = {
    energetic: ['exciting', 'dynamic', 'high energy', 'thrilling', 'action'],
    elegant: ['elegant', 'sophisticated', 'refined', 'luxurious', 'premium'],
    dramatic: ['dramatic', 'intense', 'powerful', 'grand', 'epic'],
    serene: ['calm', 'peaceful', 'relaxing', 'gentle', 'soothing'],
    festive: ['celebration', 'party', 'holiday', 'festive', 'joyful'],
    romantic: ['romantic', 'love', 'intimate', 'couple', 'anniversary'],
    professional: ['business', 'corporate', 'professional', 'formal'],
    mysterious: ['mysterious', 'enigmatic', 'dark', 'noir', 'secret'],
  };
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      return mood;
    }
  }
  
  // Default based on content type
  if (context.type === 'event') return 'energetic';
  if (context.type === 'product') return 'professional';
  
  return undefined;
}

function buildCategoryContext(mapping: CategoryMapping | undefined, context: ContentContext): string {
  if (!mapping) {
    return context.category ?? '';
  }
  
  const parts: string[] = [];
  
  // Add category keywords
  parts.push(...mapping.keywords.slice(0, 2));
  
  // Add visual elements
  if (mapping.visualElements) {
    parts.push(...mapping.visualElements.slice(0, 2));
  }
  
  return parts.join(', ');
}

function buildMoodContext(mapping: MoodMapping | undefined): string {
  if (!mapping) return '';
  
  const parts: string[] = [];
  
  parts.push(...mapping.keywords.slice(0, 2));
  
  if (mapping.atmosphere) {
    parts.push(mapping.atmosphere);
  }
  
  if (mapping.lighting) {
    parts.push(mapping.lighting);
  }
  
  return parts.join(', ');
}

function buildStyleModifiers(preset: StylePreset | undefined, additional?: string[]): string {
  const modifiers: string[] = [];
  
  if (preset) {
    modifiers.push(...preset.promptModifiers.slice(0, 3));
  }
  
  if (additional) {
    modifiers.push(...additional);
  }
  
  return modifiers.join(', ');
}

function resolveTemplate(
  template: string | PromptTemplate | undefined,
  context: ContentContext
): PromptTemplate {
  if (typeof template === 'object' && template !== null) {
    return template;
  }
  
  if (typeof template === 'string' && DEFAULT_TEMPLATES[template]) {
    return DEFAULT_TEMPLATES[template];
  }
  
  // Auto-select based on content type
  if (context.type === 'event') return DEFAULT_TEMPLATES.eventBanner;
  if (context.type === 'product') return DEFAULT_TEMPLATES.productShowcase;
  if (context.venue) return DEFAULT_TEMPLATES.venueAtmosphere;
  
  return DEFAULT_TEMPLATES.eventBanner;
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] ?? '';
  });
}

function cleanPrompt(prompt: string, maxLength: number): string {
  return prompt
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/g, '')
    .trim()
    .slice(0, maxLength);
}

function buildNegativePrompt(style?: StylePreset, mood?: MoodMapping): string {
  const parts: string[] = [
    'low quality',
    'blurry',
    'distorted',
    'deformed',
    'ugly',
    'amateur',
  ];
  
  if (style?.negativePrompt) {
    parts.push(style.negativePrompt);
  }
  
  return parts.join(', ');
}

function calculateConfidence(
  context: ContentContext,
  category?: CategoryMapping,
  mood?: MoodMapping
): number {
  let score = 0;
  
  if (context.title) score += 0.2;
  if (context.description) score += 0.15;
  if (context.category) score += 0.15;
  if (context.mood) score += 0.1;
  if (context.style) score += 0.1;
  if (category) score += 0.15;
  if (mood) score += 0.15;
  
  return Math.min(score, 1);
}

// ============================================
// Additional Utilities
// ============================================

/**
 * Create a simple prompt from minimal input
 */
export function createSimplePrompt(
  subject: string,
  style?: string,
  mood?: string
): DerivedPrompt {
  return derivePromptFromContent({
    title: subject,
    style,
    mood,
  });
}

/**
 * Enhance an existing prompt with style/mood
 */
export function enhancePrompt(
  basePrompt: string,
  style?: string,
  mood?: string
): string {
  const parts = [basePrompt];
  
  if (style) {
    const preset = getStylePreset(style);
    if (preset) {
      parts.push(...preset.promptModifiers.slice(0, 2));
    }
  }
  
  if (mood) {
    const mapping = getMoodMapping(mood);
    if (mapping) {
      parts.push(...mapping.keywords.slice(0, 2));
      if (mapping.lighting) parts.push(mapping.lighting);
    }
  }
  
  return parts.join(', ');
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): PromptTemplate | undefined {
  return DEFAULT_TEMPLATES[id];
}

/**
 * Get all available template IDs
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(DEFAULT_TEMPLATES);
}
