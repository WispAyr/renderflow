// ============================================
// RenderFlow Core Types
// ============================================

// --------------------------------------------
// Client / Tenant
// --------------------------------------------

export interface Client {
  id: string;
  name: string;
  slug: string;
  branding: ClientBranding;
  settings: ClientSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientBranding {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent?: string;
  };
  logo?: string;
  logoLight?: string;
  logoDark?: string;
  theme?: 'light' | 'dark' | 'auto';
  customCSS?: string;
}

export interface ClientSettings {
  defaultDuration?: number;
  defaultFormat?: OutputFormat;
  aiEnabled?: boolean;
  preferredAIProvider?: AIProviderType;
  watermark?: boolean;
}

// --------------------------------------------
// Content
// --------------------------------------------

export type ContentType = 'event' | 'product' | 'message' | 'stat' | 'media';

export interface ContentItem {
  id: string;
  clientId: string;
  type: ContentType;
  
  // Universal fields
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  images?: string[];
  video?: string;
  
  // Categorization
  category?: string;
  tags?: string[];
  
  // Event-specific
  date?: string;
  dateEnd?: string;
  time?: string;
  timeEnd?: string;
  venue?: string;
  price?: string;
  priceRange?: { min: number; max: number; currency: string };
  ticketUrl?: string;
  accessibility?: string[];
  
  // Product-specific
  sku?: string;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
  nutritionFacts?: Record<string, string>;
  inStock?: boolean;
  featured?: boolean;
  
  // Stat-specific
  value?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  change?: number;
  changePercent?: number;
  
  // AI hints
  mood?: string;
  style?: string;
  aiPromptHint?: string;
  
  // Metadata
  sortOrder?: number;
  active?: boolean;
  publishAt?: Date;
  expireAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --------------------------------------------
// Templates
// --------------------------------------------

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  
  // Compatibility
  contentTypes: ContentType[];
  
  // Available formats
  formats: OutputFormat[];
  
  // Duration options (seconds)
  durations: number[];
  defaultDuration: number;
  
  // Composition reference
  compositionId: string;
  
  // Slot definitions
  slots: TemplateSlot[];
  
  // Preview
  previewImage?: string;
  previewVideo?: string;
  
  // Metadata
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory = 
  | 'promo'
  | 'countdown'
  | 'branding'
  | 'menu'
  | 'stats'
  | 'alert'
  | 'social'
  | 'ambient';

export interface TemplateSlot {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'background' | 'logo';
  required: boolean;
  
  // Data binding
  dataField?: string;  // e.g., "content.title"
  
  // AI generation options
  aiGenerate?: {
    enabled: boolean;
    promptTemplate?: string;  // e.g., "theatrical {category} scene, {mood}"
    style?: string;
    provider?: AIProviderType;
  };
  
  // Fallback
  defaultValue?: string;
  defaultAsset?: string;
  
  // Constraints
  maxLength?: number;
  dimensions?: { width: number; height: number };
}

// --------------------------------------------
// Output / Render
// --------------------------------------------

export type OutputFormat = 'landscape' | 'portrait' | 'square';

export interface OutputDimensions {
  landscape: { width: 1920; height: 1080 };
  portrait: { width: 1080; height: 1920 };
  square: { width: 1080; height: 1080 };
}

export interface RenderJob {
  id: string;
  clientId: string;
  
  // Input
  contentId?: string;
  contentIds?: string[];  // For reels/playlists
  templateId: string;
  
  // Output config
  format: OutputFormat;
  duration: number;
  fps?: number;
  quality?: 'draft' | 'standard' | 'high';
  
  // AI options
  aiOptions?: AIRenderOptions;
  
  // Custom overrides
  overrides?: Record<string, any>;
  
  // Status
  status: RenderStatus;
  progress: number;
  error?: string;
  
  // Output
  outputPath?: string;
  outputUrl?: string;
  thumbnailPath?: string;
  
  // Timing
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type RenderStatus = 
  | 'queued'
  | 'processing'
  | 'rendering'
  | 'encoding'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AIRenderOptions {
  enabled: boolean;
  
  // Per-slot AI options
  slots?: Record<string, AISlotOptions>;
  
  // Global AI options
  globalStyle?: string;
  globalMood?: string;
  provider?: AIProviderType;
}

export interface AISlotOptions {
  generate: boolean;
  prompt?: string;
  deriveFromContent?: boolean;
  provider?: AIProviderType;
  style?: string;
}

// --------------------------------------------
// AI Providers
// --------------------------------------------

export type AIProviderType = 'grok' | 'dalle' | 'openai' | 'runway' | 'pika' | 'midjourney' | 'stability';

export interface AIProvider {
  id: AIProviderType;
  name: string;
  capabilities: AICapability[];
  maxDuration?: number;  // For video providers
  costPerUnit?: number;
  rateLimit?: number;
}

export type AICapability = 'image' | 'video' | 'upscale' | 'edit' | 'inpaint' | 'animate';

export interface AIGenerateRequest {
  type: 'image' | 'video' | 'background';
  provider?: AIProviderType;
  
  // Prompt options
  prompt?: string;
  negativePrompt?: string;
  
  // Derive from content
  deriveFrom?: {
    title?: string;
    category?: string;
    mood?: string;
    style?: string;
    description?: string;
  };
  
  // Output specs
  dimensions: { width: number; height: number };
  duration?: number;  // For video
  
  // Style options
  style?: string;
  quality?: 'draft' | 'standard' | 'high';
}

export interface AIGenerateResponse {
  success: boolean;
  assetPath?: string;
  assetUrl?: string;
  provider: AIProviderType;
  prompt: string;  // Final prompt used
  duration?: number;
  cost?: number;
  error?: string;
}

// --------------------------------------------
// Screens / Displays
// --------------------------------------------

export interface Screen {
  id: string;
  clientId?: string;  // Optional - can be shared
  name: string;
  description?: string;
  
  // Physical info
  location?: string;
  dimensions?: { width: number; height: number };
  orientation: 'landscape' | 'portrait';
  
  // Connection
  connectionType: 'websocket' | 'poll' | 'push';
  connectionUrl?: string;
  lastSeen?: Date;
  online: boolean;
  
  // Current content
  currentContent?: {
    type: 'video' | 'playlist' | 'url';
    source: string;
    startedAt: Date;
  };
  
  // Playlist assignment
  playlistId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// --------------------------------------------
// Playlists
// --------------------------------------------

export interface Playlist {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  
  // Items
  items: PlaylistItem[];
  
  // Playback settings
  loop: boolean;
  shuffle: boolean;
  transitionType?: 'cut' | 'fade' | 'slide';
  transitionDuration?: number;
  
  // Scheduling
  schedule?: PlaylistSchedule;
  
  // Assigned screens
  screenIds?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistItem {
  id: string;
  order: number;
  
  // Content reference
  type: 'render' | 'video' | 'image' | 'url';
  source: string;  // Job ID, file path, or URL
  
  // Playback
  duration?: number;  // Override for images/URLs
  
  // Scheduling
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[];  // 0-6
  startTime?: string;  // HH:mm
  endTime?: string;
}

export interface PlaylistSchedule {
  timezone: string;
  rules: ScheduleRule[];
}

export interface ScheduleRule {
  id: string;
  name?: string;
  
  // Time conditions
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  startDate?: Date;
  endDate?: Date;
  
  // Override playlist
  playlistId?: string;
  
  // Or override specific items
  enableItems?: string[];
  disableItems?: string[];
}

// --------------------------------------------
// Social Media Export
// --------------------------------------------

export interface SocialExport {
  id: string;
  renderJobId: string;
  
  platform: SocialPlatform;
  format: SocialFormat;
  
  // Status
  status: 'pending' | 'processing' | 'ready' | 'published' | 'failed';
  
  // Output
  outputPath?: string;
  outputUrl?: string;
  
  // Publishing
  publishAt?: Date;
  publishedAt?: Date;
  postId?: string;
  postUrl?: string;
  
  createdAt: Date;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin';

export interface SocialFormat {
  platform: SocialPlatform;
  type: 'post' | 'story' | 'reel' | 'short';
  dimensions: { width: number; height: number };
  maxDuration?: number;
  aspectRatio: string;
}

export const SOCIAL_FORMATS: Record<string, SocialFormat> = {
  'instagram-post': { platform: 'instagram', type: 'post', dimensions: { width: 1080, height: 1080 }, aspectRatio: '1:1' },
  'instagram-story': { platform: 'instagram', type: 'story', dimensions: { width: 1080, height: 1920 }, maxDuration: 60, aspectRatio: '9:16' },
  'instagram-reel': { platform: 'instagram', type: 'reel', dimensions: { width: 1080, height: 1920 }, maxDuration: 90, aspectRatio: '9:16' },
  'facebook-post': { platform: 'facebook', type: 'post', dimensions: { width: 1200, height: 630 }, aspectRatio: '1.91:1' },
  'tiktok-video': { platform: 'tiktok', type: 'reel', dimensions: { width: 1080, height: 1920 }, maxDuration: 180, aspectRatio: '9:16' },
  'youtube-short': { platform: 'youtube', type: 'short', dimensions: { width: 1080, height: 1920 }, maxDuration: 60, aspectRatio: '9:16' },
};
