import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, real, pgEnum } from 'drizzle-orm/pg-core';

// ============================================
// Enums
// ============================================

export const contentTypeEnum = pgEnum('content_type', ['event', 'product', 'message', 'stat', 'media']);
export const outputFormatEnum = pgEnum('output_format', ['landscape', 'portrait', 'square']);
export const renderStatusEnum = pgEnum('render_status', ['queued', 'processing', 'rendering', 'encoding', 'completed', 'failed', 'cancelled']);
export const orientationEnum = pgEnum('orientation', ['landscape', 'portrait']);
export const connectionTypeEnum = pgEnum('connection_type', ['websocket', 'poll', 'push']);
export const playlistItemTypeEnum = pgEnum('playlist_item_type', ['render', 'video', 'image', 'url']);
export const aiProviderEnum = pgEnum('ai_provider', ['grok', 'dalle', 'openai', 'runway', 'pika', 'midjourney', 'stability']);
export const aiGenerationTypeEnum = pgEnum('ai_generation_type', ['image', 'video', 'background']);
export const qualityEnum = pgEnum('quality', ['draft', 'standard', 'high']);
export const templateCategoryEnum = pgEnum('template_category', ['promo', 'countdown', 'branding', 'menu', 'stats', 'alert', 'social', 'ambient']);

// ============================================
// Clients
// ============================================

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  branding: jsonb('branding').notNull().$type<{
    colors: { primary: string; secondary: string; accent?: string; background: string; text: string };
    fonts: { heading: string; body: string; accent?: string };
    logo?: string;
    logoLight?: string;
    logoDark?: string;
    theme?: 'light' | 'dark' | 'auto';
    customCSS?: string;
  }>(),
  settings: jsonb('settings').$type<{
    defaultDuration?: number;
    defaultFormat?: 'landscape' | 'portrait' | 'square';
    aiEnabled?: boolean;
    preferredAIProvider?: string;
    watermark?: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Content Items
// ============================================

export const contentItems = pgTable('content_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  type: contentTypeEnum('type').notNull(),
  
  // Universal
  title: varchar('title', { length: 200 }).notNull(),
  subtitle: varchar('subtitle', { length: 200 }),
  description: text('description'),
  image: text('image'),
  images: jsonb('images').$type<string[]>(),
  video: text('video'),
  
  // Categorization
  category: varchar('category', { length: 50 }),
  tags: jsonb('tags').$type<string[]>(),
  
  // Event-specific
  date: varchar('date', { length: 50 }),
  dateEnd: varchar('date_end', { length: 50 }),
  time: varchar('time', { length: 20 }),
  timeEnd: varchar('time_end', { length: 20 }),
  venue: varchar('venue', { length: 200 }),
  price: varchar('price', { length: 50 }),
  priceRange: jsonb('price_range').$type<{ min: number; max: number; currency: string }>(),
  ticketUrl: text('ticket_url'),
  accessibility: jsonb('accessibility').$type<string[]>(),
  
  // Product-specific
  sku: varchar('sku', { length: 50 }),
  calories: integer('calories'),
  allergens: jsonb('allergens').$type<string[]>(),
  ingredients: jsonb('ingredients').$type<string[]>(),
  nutritionFacts: jsonb('nutrition_facts').$type<Record<string, string>>(),
  inStock: boolean('in_stock'),
  featured: boolean('featured'),
  
  // Stat-specific
  value: real('value'),
  unit: varchar('unit', { length: 30 }),
  trend: varchar('trend', { length: 10 }),
  change: real('change'),
  changePercent: real('change_percent'),
  
  // AI hints
  mood: varchar('mood', { length: 50 }),
  style: varchar('style', { length: 50 }),
  aiPromptHint: text('ai_prompt_hint'),
  
  // Metadata
  sortOrder: integer('sort_order'),
  active: boolean('active').default(true),
  publishAt: timestamp('publish_at'),
  expireAt: timestamp('expire_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Templates
// ============================================

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: templateCategoryEnum('category').notNull(),
  contentTypes: jsonb('content_types').$type<string[]>().notNull(),
  formats: jsonb('formats').$type<string[]>().notNull(),
  durations: jsonb('durations').$type<number[]>().notNull(),
  defaultDuration: integer('default_duration').notNull(),
  compositionId: varchar('composition_id', { length: 100 }).notNull(),
  slots: jsonb('slots').$type<Array<{
    id: string;
    name: string;
    type: 'text' | 'image' | 'video' | 'background' | 'logo';
    required: boolean;
    dataField?: string;
    aiGenerate?: { enabled: boolean; promptTemplate?: string; style?: string; provider?: string };
    defaultValue?: string;
    defaultAsset?: string;
    maxLength?: number;
    dimensions?: { width: number; height: number };
  }>>().notNull(),
  previewImage: text('preview_image'),
  previewVideo: text('preview_video'),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Render Jobs
// ============================================

export const renderJobs = pgTable('render_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  contentId: uuid('content_id').references(() => contentItems.id, { onDelete: 'set null' }),
  contentIds: jsonb('content_ids').$type<string[]>(),
  templateId: uuid('template_id').notNull().references(() => templates.id),
  format: outputFormatEnum('format').notNull(),
  duration: integer('duration').notNull(),
  fps: integer('fps').default(30),
  quality: qualityEnum('quality').default('standard'),
  aiOptions: jsonb('ai_options').$type<{
    enabled: boolean;
    slots?: Record<string, { generate: boolean; prompt?: string; deriveFromContent?: boolean; provider?: string; style?: string }>;
    globalStyle?: string;
    globalMood?: string;
    provider?: string;
  }>(),
  overrides: jsonb('overrides').$type<Record<string, unknown>>(),
  status: renderStatusEnum('status').default('queued').notNull(),
  progress: integer('progress').default(0).notNull(),
  error: text('error'),
  outputPath: text('output_path'),
  outputUrl: text('output_url'),
  thumbnailPath: text('thumbnail_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
});

// ============================================
// Screens
// ============================================

export const screens = pgTable('screens', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 200 }),
  dimensions: jsonb('dimensions').$type<{ width: number; height: number }>(),
  orientation: orientationEnum('orientation').notNull(),
  connectionType: connectionTypeEnum('connection_type').notNull(),
  connectionUrl: text('connection_url'),
  lastSeen: timestamp('last_seen'),
  online: boolean('online').default(false).notNull(),
  currentContent: jsonb('current_content').$type<{
    type: 'video' | 'playlist' | 'url';
    source: string;
    startedAt: string;
  }>(),
  playlistId: uuid('playlist_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Playlists
// ============================================

export const playlists = pgTable('playlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  items: jsonb('items').$type<Array<{
    id: string;
    order: number;
    type: 'render' | 'video' | 'image' | 'url';
    source: string;
    duration?: number;
    startDate?: string;
    endDate?: string;
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
  }>>().notNull(),
  loop: boolean('loop').default(true).notNull(),
  shuffle: boolean('shuffle').default(false).notNull(),
  transitionType: varchar('transition_type', { length: 20 }),
  transitionDuration: integer('transition_duration'),
  screenIds: jsonb('screen_ids').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// AI Generation Jobs
// ============================================

export const aiGenerationJobs = pgTable('ai_generation_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  type: aiGenerationTypeEnum('type').notNull(),
  provider: aiProviderEnum('provider'),
  prompt: text('prompt'),
  negativePrompt: text('negative_prompt'),
  deriveFrom: jsonb('derive_from').$type<{
    title?: string;
    category?: string;
    mood?: string;
    style?: string;
    description?: string;
  }>(),
  dimensions: jsonb('dimensions').$type<{ width: number; height: number }>().notNull(),
  duration: integer('duration'),
  style: varchar('style', { length: 50 }),
  quality: qualityEnum('quality').default('standard'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  progress: integer('progress').default(0).notNull(),
  error: text('error'),
  assetPath: text('asset_path'),
  assetUrl: text('asset_url'),
  finalPrompt: text('final_prompt'),
  cost: real('cost'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});
