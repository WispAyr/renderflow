import { z } from 'zod';

// ============================================
// Zod Schemas for Validation
// ============================================

// --------------------------------------------
// Client
// --------------------------------------------

export const ClientBrandingSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string().optional(),
    background: z.string(),
    text: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    accent: z.string().optional(),
  }),
  logo: z.string().optional(),
  logoLight: z.string().optional(),
  logoDark: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  customCSS: z.string().optional(),
});

export const ClientSettingsSchema = z.object({
  defaultDuration: z.number().optional(),
  defaultFormat: z.enum(['landscape', 'portrait', 'square']).optional(),
  aiEnabled: z.boolean().optional(),
  preferredAIProvider: z.enum(['grok', 'dalle', 'openai', 'runway', 'pika', 'midjourney', 'stability']).optional(),
  watermark: z.boolean().optional(),
});

export const CreateClientSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  branding: ClientBrandingSchema,
  settings: ClientSettingsSchema.optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// --------------------------------------------
// Content
// --------------------------------------------

export const ContentTypeSchema = z.enum(['event', 'product', 'message', 'stat', 'media']);

export const CreateContentSchema = z.object({
  clientId: z.string().uuid(),
  type: ContentTypeSchema,
  
  // Universal
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  video: z.string().url().optional(),
  
  // Categorization
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).optional(),
  
  // Event-specific
  date: z.string().optional(),
  dateEnd: z.string().optional(),
  time: z.string().optional(),
  timeEnd: z.string().optional(),
  venue: z.string().optional(),
  price: z.string().optional(),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).optional(),
  ticketUrl: z.string().url().optional(),
  accessibility: z.array(z.string()).optional(),
  
  // Product-specific
  sku: z.string().optional(),
  calories: z.number().optional(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  nutritionFacts: z.record(z.string()).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  
  // Stat-specific
  value: z.number().optional(),
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'flat']).optional(),
  change: z.number().optional(),
  changePercent: z.number().optional(),
  
  // AI hints
  mood: z.string().optional(),
  style: z.string().optional(),
  aiPromptHint: z.string().optional(),
  
  // Metadata
  sortOrder: z.number().optional(),
  active: z.boolean().optional(),
  publishAt: z.coerce.date().optional(),
  expireAt: z.coerce.date().optional(),
});

export const UpdateContentSchema = CreateContentSchema.partial().omit({ clientId: true });

// --------------------------------------------
// Render
// --------------------------------------------

export const AISlotOptionsSchema = z.object({
  generate: z.boolean(),
  prompt: z.string().optional(),
  deriveFromContent: z.boolean().optional(),
  provider: z.enum(['grok', 'dalle', 'openai', 'runway', 'pika', 'midjourney', 'stability']).optional(),
  style: z.string().optional(),
});

export const AIRenderOptionsSchema = z.object({
  enabled: z.boolean(),
  slots: z.record(AISlotOptionsSchema).optional(),
  globalStyle: z.string().optional(),
  globalMood: z.string().optional(),
  provider: z.enum(['grok', 'dalle', 'openai', 'runway', 'pika', 'midjourney', 'stability']).optional(),
});

export const CreateRenderJobSchema = z.object({
  clientId: z.string().uuid(),
  contentId: z.string().uuid().optional(),
  contentIds: z.array(z.string().uuid()).optional(),
  templateId: z.string(),
  format: z.enum(['landscape', 'portrait', 'square']),
  duration: z.number().min(1).max(300),
  fps: z.number().min(24).max(60).optional(),
  quality: z.enum(['draft', 'standard', 'high']).optional(),
  aiOptions: AIRenderOptionsSchema.optional(),
  overrides: z.record(z.any()).optional(),
});

// --------------------------------------------
// Playlist
// --------------------------------------------

export const PlaylistItemSchema = z.object({
  id: z.string().optional(),
  order: z.number(),
  type: z.enum(['render', 'video', 'image', 'url']),
  source: z.string(),
  duration: z.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const CreatePlaylistSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  items: z.array(PlaylistItemSchema),
  loop: z.boolean().default(true),
  shuffle: z.boolean().default(false),
  transitionType: z.enum(['cut', 'fade', 'slide']).optional(),
  transitionDuration: z.number().optional(),
  screenIds: z.array(z.string()).optional(),
});

export const UpdatePlaylistSchema = CreatePlaylistSchema.partial().omit({ clientId: true });

// --------------------------------------------
// AI Generation
// --------------------------------------------

export const AIGenerateRequestSchema = z.object({
  type: z.enum(['image', 'video', 'background']),
  provider: z.enum(['grok', 'dalle', 'openai', 'runway', 'pika', 'midjourney', 'stability']).optional(),
  prompt: z.string().optional(),
  negativePrompt: z.string().optional(),
  deriveFrom: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    mood: z.string().optional(),
    style: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  dimensions: z.object({
    width: z.number().min(256).max(4096),
    height: z.number().min(256).max(4096),
  }),
  duration: z.number().min(1).max(30).optional(),
  style: z.string().optional(),
  quality: z.enum(['draft', 'standard', 'high']).optional(),
});

// --------------------------------------------
// Screen
// --------------------------------------------

export const CreateScreenSchema = z.object({
  clientId: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  location: z.string().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  orientation: z.enum(['landscape', 'portrait']),
  connectionType: z.enum(['websocket', 'poll', 'push']),
  connectionUrl: z.string().url().optional(),
  playlistId: z.string().uuid().optional(),
});

export const UpdateScreenSchema = CreateScreenSchema.partial();
