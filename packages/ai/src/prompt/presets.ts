/**
 * @renderflow/ai - Style and Mood Presets
 * Pre-defined mappings for generating contextual prompts
 */

import type { StylePreset, MoodMapping, CategoryMapping } from '../types.js';

// ============================================
// Style Presets
// ============================================

export const STYLE_PRESETS: Record<string, StylePreset> = {
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Film-like quality with dramatic lighting and composition',
    promptModifiers: [
      'cinematic lighting',
      'film grain',
      'dramatic composition',
      'movie still',
      'anamorphic lens',
      'shallow depth of field',
    ],
    negativePrompt: 'amateur, poorly lit, flat lighting, snapshot',
    parameters: {
      guidanceScale: 7.5,
    },
  },
  
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    description: 'Clean, professional magazine-quality imagery',
    promptModifiers: [
      'editorial photography',
      'professional lighting',
      'high fashion',
      'clean composition',
      'magazine quality',
    ],
    negativePrompt: 'cluttered, messy, amateur, low quality',
    parameters: {
      guidanceScale: 7.0,
    },
  },
  
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold, saturated colors with high energy',
    promptModifiers: [
      'vibrant colors',
      'highly saturated',
      'bold',
      'eye-catching',
      'dynamic',
      'energetic',
    ],
    negativePrompt: 'muted, desaturated, dull, boring',
  },
  
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple, with lots of negative space',
    promptModifiers: [
      'minimalist',
      'clean',
      'simple',
      'negative space',
      'uncluttered',
      'elegant simplicity',
    ],
    negativePrompt: 'busy, cluttered, complex, chaotic',
  },
  
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'High-end, sophisticated, premium feel',
    promptModifiers: [
      'luxury',
      'premium',
      'sophisticated',
      'elegant',
      'high-end',
      'refined',
      'gold accents',
    ],
    negativePrompt: 'cheap, low quality, tacky, gaudy',
  },
  
  retro: {
    id: 'retro',
    name: 'Retro',
    description: 'Vintage aesthetics with nostalgic appeal',
    promptModifiers: [
      'retro',
      'vintage',
      'nostalgic',
      '70s aesthetic',
      'film photography',
      'warm tones',
    ],
    negativePrompt: 'modern, digital, futuristic',
  },
  
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Glowing neon lights and cyberpunk vibes',
    promptModifiers: [
      'neon lights',
      'cyberpunk',
      'glowing',
      'night scene',
      'neon signs',
      'synthwave',
    ],
    negativePrompt: 'daylight, natural lighting, muted colors',
  },
  
  natural: {
    id: 'natural',
    name: 'Natural',
    description: 'Organic, earthy, authentic feel',
    promptModifiers: [
      'natural lighting',
      'organic',
      'earthy tones',
      'authentic',
      'candid',
      'real',
    ],
    negativePrompt: 'artificial, staged, over-processed',
  },
  
  dramatic: {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'High contrast with intense atmosphere',
    promptModifiers: [
      'dramatic lighting',
      'high contrast',
      'chiaroscuro',
      'intense',
      'moody shadows',
      'atmospheric',
    ],
    negativePrompt: 'flat, even lighting, low contrast',
    parameters: {
      guidanceScale: 8.0,
    },
  },
  
  playful: {
    id: 'playful',
    name: 'Playful',
    description: 'Fun, whimsical, lighthearted imagery',
    promptModifiers: [
      'playful',
      'fun',
      'whimsical',
      'cheerful',
      'lighthearted',
      'colorful',
    ],
    negativePrompt: 'serious, dark, somber, gloomy',
  },
};

// ============================================
// Mood Mappings
// ============================================

export const MOOD_MAPPINGS: Record<string, MoodMapping> = {
  energetic: {
    mood: 'energetic',
    keywords: ['dynamic', 'vibrant', 'action', 'motion', 'powerful', 'intense'],
    colors: ['orange', 'red', 'yellow', 'electric blue'],
    lighting: 'dramatic side lighting with motion blur',
    atmosphere: 'high energy, explosive',
  },
  
  elegant: {
    mood: 'elegant',
    keywords: ['sophisticated', 'refined', 'graceful', 'luxurious', 'timeless'],
    colors: ['gold', 'cream', 'black', 'champagne'],
    lighting: 'soft, diffused, golden hour',
    atmosphere: 'refined and sophisticated',
  },
  
  dramatic: {
    mood: 'dramatic',
    keywords: ['intense', 'powerful', 'theatrical', 'bold', 'striking'],
    colors: ['deep red', 'black', 'gold', 'purple'],
    lighting: 'high contrast, chiaroscuro, spot lighting',
    atmosphere: 'intense and captivating',
  },
  
  serene: {
    mood: 'serene',
    keywords: ['calm', 'peaceful', 'tranquil', 'soothing', 'gentle'],
    colors: ['soft blue', 'white', 'pastel green', 'lavender'],
    lighting: 'soft, even, natural daylight',
    atmosphere: 'peaceful and calming',
  },
  
  mysterious: {
    mood: 'mysterious',
    keywords: ['enigmatic', 'shadowy', 'intriguing', 'atmospheric', 'moody'],
    colors: ['deep purple', 'black', 'dark blue', 'silver'],
    lighting: 'low key, shadows, rim lighting',
    atmosphere: 'enigmatic and intriguing',
  },
  
  festive: {
    mood: 'festive',
    keywords: ['celebratory', 'joyful', 'bright', 'cheerful', 'sparkling'],
    colors: ['red', 'green', 'gold', 'silver', 'multicolor'],
    lighting: 'bright, warm, twinkling lights',
    atmosphere: 'joyful celebration',
  },
  
  romantic: {
    mood: 'romantic',
    keywords: ['intimate', 'soft', 'warm', 'loving', 'tender'],
    colors: ['rose', 'blush pink', 'warm gold', 'soft white'],
    lighting: 'soft candlelight, golden hour, bokeh',
    atmosphere: 'intimate and warm',
  },
  
  professional: {
    mood: 'professional',
    keywords: ['corporate', 'clean', 'modern', 'trustworthy', 'competent'],
    colors: ['navy blue', 'white', 'gray', 'subtle teal'],
    lighting: 'clean, even, professional studio',
    atmosphere: 'trustworthy and competent',
  },
  
  nostalgic: {
    mood: 'nostalgic',
    keywords: ['vintage', 'retro', 'warm memories', 'classic', 'timeless'],
    colors: ['sepia', 'warm browns', 'faded colors', 'golden yellow'],
    lighting: 'warm, soft, film-like',
    atmosphere: 'warm memories of the past',
  },
  
  futuristic: {
    mood: 'futuristic',
    keywords: ['modern', 'tech', 'innovative', 'sleek', 'advanced'],
    colors: ['electric blue', 'neon', 'silver', 'white', 'black'],
    lighting: 'LED, neon glow, rim lighting',
    atmosphere: 'cutting-edge and innovative',
  },
};

// ============================================
// Category Mappings
// ============================================

export const CATEGORY_MAPPINGS: Record<string, CategoryMapping> = {
  // Entertainment
  opera: {
    category: 'opera',
    keywords: ['classical', 'theatrical', 'grand', 'dramatic', 'elegant'],
    suggestedStyles: ['dramatic', 'cinematic', 'luxury'],
    suggestedMoods: ['dramatic', 'elegant'],
    visualElements: ['velvet curtains', 'chandeliers', 'ornate architecture', 'stage lighting'],
  },
  
  concert: {
    category: 'concert',
    keywords: ['live music', 'performance', 'stage', 'crowd', 'energy'],
    suggestedStyles: ['cinematic', 'vibrant', 'neon'],
    suggestedMoods: ['energetic', 'dramatic'],
    visualElements: ['stage lights', 'crowd', 'instruments', 'smoke effects'],
  },
  
  theatre: {
    category: 'theatre',
    keywords: ['stage', 'performance', 'drama', 'acting', 'theatrical'],
    suggestedStyles: ['dramatic', 'cinematic'],
    suggestedMoods: ['dramatic', 'mysterious'],
    visualElements: ['spotlight', 'stage', 'curtains', 'dramatic shadows'],
  },
  
  comedy: {
    category: 'comedy',
    keywords: ['funny', 'laughing', 'humor', 'entertainment', 'fun'],
    suggestedStyles: ['vibrant', 'playful'],
    suggestedMoods: ['energetic', 'festive'],
    visualElements: ['spotlight', 'microphone', 'stage', 'warm lighting'],
  },
  
  // Food & Dining
  restaurant: {
    category: 'restaurant',
    keywords: ['dining', 'culinary', 'gourmet', 'food', 'chef'],
    suggestedStyles: ['editorial', 'luxury', 'natural'],
    suggestedMoods: ['elegant', 'romantic'],
    visualElements: ['table setting', 'ambient lighting', 'plated food', 'wine'],
  },
  
  cafe: {
    category: 'cafe',
    keywords: ['coffee', 'cozy', 'casual', 'breakfast', 'pastries'],
    suggestedStyles: ['natural', 'minimal'],
    suggestedMoods: ['serene', 'romantic'],
    visualElements: ['coffee cups', 'pastries', 'natural light', 'plants'],
  },
  
  bar: {
    category: 'bar',
    keywords: ['cocktails', 'nightlife', 'drinks', 'social', 'lounge'],
    suggestedStyles: ['neon', 'luxury', 'dramatic'],
    suggestedMoods: ['mysterious', 'energetic'],
    visualElements: ['cocktails', 'bar counter', 'mood lighting', 'bottles'],
  },
  
  // Retail
  fashion: {
    category: 'fashion',
    keywords: ['clothing', 'style', 'trendy', 'boutique', 'designer'],
    suggestedStyles: ['editorial', 'minimal', 'luxury'],
    suggestedMoods: ['elegant', 'professional'],
    visualElements: ['mannequins', 'clothing racks', 'mirrors', 'studio lighting'],
  },
  
  electronics: {
    category: 'electronics',
    keywords: ['tech', 'gadgets', 'modern', 'innovation', 'devices'],
    suggestedStyles: ['minimal', 'neon'],
    suggestedMoods: ['futuristic', 'professional'],
    visualElements: ['devices', 'clean surfaces', 'LED lights', 'reflections'],
  },
  
  // Sports & Fitness
  sports: {
    category: 'sports',
    keywords: ['athletic', 'competition', 'team', 'action', 'victory'],
    suggestedStyles: ['cinematic', 'vibrant'],
    suggestedMoods: ['energetic', 'dramatic'],
    visualElements: ['stadium', 'athletes', 'motion blur', 'dramatic lighting'],
  },
  
  fitness: {
    category: 'fitness',
    keywords: ['gym', 'workout', 'health', 'strength', 'wellness'],
    suggestedStyles: ['vibrant', 'editorial'],
    suggestedMoods: ['energetic', 'professional'],
    visualElements: ['gym equipment', 'athletic wear', 'dynamic poses', 'sweat'],
  },
  
  // Events
  wedding: {
    category: 'wedding',
    keywords: ['celebration', 'love', 'ceremony', 'elegant', 'romantic'],
    suggestedStyles: ['editorial', 'natural'],
    suggestedMoods: ['romantic', 'elegant'],
    visualElements: ['flowers', 'rings', 'soft lighting', 'white details'],
  },
  
  corporate: {
    category: 'corporate',
    keywords: ['business', 'professional', 'conference', 'meeting', 'office'],
    suggestedStyles: ['minimal', 'editorial'],
    suggestedMoods: ['professional'],
    visualElements: ['office space', 'people in suits', 'presentation', 'clean lines'],
  },
  
  // Travel & Hospitality
  hotel: {
    category: 'hotel',
    keywords: ['luxury', 'accommodation', 'travel', 'comfort', 'hospitality'],
    suggestedStyles: ['luxury', 'editorial'],
    suggestedMoods: ['elegant', 'serene'],
    visualElements: ['luxurious room', 'bed', 'amenities', 'view'],
  },
  
  travel: {
    category: 'travel',
    keywords: ['adventure', 'destination', 'explore', 'journey', 'wanderlust'],
    suggestedStyles: ['cinematic', 'natural'],
    suggestedMoods: ['energetic', 'serene'],
    visualElements: ['landmarks', 'landscapes', 'local culture', 'transportation'],
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get a style preset by ID
 */
export function getStylePreset(id: string): StylePreset | undefined {
  return STYLE_PRESETS[id.toLowerCase()];
}

/**
 * Get a mood mapping by mood name
 */
export function getMoodMapping(mood: string): MoodMapping | undefined {
  return MOOD_MAPPINGS[mood.toLowerCase()];
}

/**
 * Get a category mapping by category name
 */
export function getCategoryMapping(category: string): CategoryMapping | undefined {
  // Try exact match first
  const normalized = category.toLowerCase().replace(/[^a-z]/g, '');
  if (CATEGORY_MAPPINGS[normalized]) {
    return CATEGORY_MAPPINGS[normalized];
  }
  
  // Try partial match
  for (const [key, mapping] of Object.entries(CATEGORY_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping;
    }
    // Check keywords
    if (mapping.keywords.some(kw => normalized.includes(kw) || kw.includes(normalized))) {
      return mapping;
    }
  }
  
  return undefined;
}

/**
 * Get all available style preset IDs
 */
export function getAvailableStyles(): string[] {
  return Object.keys(STYLE_PRESETS);
}

/**
 * Get all available mood names
 */
export function getAvailableMoods(): string[] {
  return Object.keys(MOOD_MAPPINGS);
}

/**
 * Get all available category names
 */
export function getAvailableCategories(): string[] {
  return Object.keys(CATEGORY_MAPPINGS);
}
