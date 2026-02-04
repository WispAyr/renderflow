// Mirror of core types for web use

export interface Client {
  id: string;
  name: string;
  slug: string;
  branding: ClientBranding;
  settings: ClientSettings;
  createdAt: string;
  updatedAt: string;
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
  preferredAIProvider?: string;
  watermark?: boolean;
}

export type ContentType = 'event' | 'product' | 'message' | 'stat' | 'media';

export interface ContentItem {
  id: string;
  clientId: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  images?: string[];
  video?: string;
  category?: string;
  tags?: string[];
  date?: string;
  dateEnd?: string;
  time?: string;
  timeEnd?: string;
  venue?: string;
  price?: string;
  value?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  active?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  contentTypes: ContentType[];
  formats: OutputFormat[];
  durations: number[];
  defaultDuration: number;
  compositionId: string;
  slots: TemplateSlot[];
  previewImage?: string;
  previewVideo?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 'promo' | 'countdown' | 'branding' | 'menu' | 'event' | 'social' | 'stats' | 'generic';

export interface TemplateSlot {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'logo' | 'data';
  required: boolean;
  default?: string;
  maxLength?: number;
  aiGenerable?: boolean;
  aiPromptTemplate?: string;
}

export type OutputFormat = 
  | 'landscape_1920x1080'
  | 'portrait_1080x1920'
  | 'square_1080x1080'
  | 'ultrawide_2560x1080'
  | 'social_1200x628'
  | 'story_1080x1920';

export interface RenderJob {
  id: string;
  clientId: string;
  contentId: string;
  templateId: string;
  format: OutputFormat;
  duration: number;
  status: RenderStatus;
  progress: number;
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  aiOptions?: AIRenderOptions;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type RenderStatus = 'queued' | 'processing' | 'rendering' | 'completed' | 'failed';

export interface AIRenderOptions {
  enabled: boolean;
  generateBackground?: boolean;
  enhanceImage?: boolean;
  generateCopy?: boolean;
  provider?: string;
  style?: string;
  mood?: string;
}

export interface Screen {
  id: string;
  name: string;
  clientId?: string;
  location?: string;
  status: 'online' | 'offline' | 'idle';
  currentContent?: string;
  playlistId?: string;
  resolution?: string;
  orientation?: 'landscape' | 'portrait';
  lastSeen?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  clientId?: string;
  description?: string;
  items: PlaylistItem[];
  schedule?: PlaylistSchedule;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  contentId?: string;
  renderJobId?: string;
  mediaUrl?: string;
  duration: number;
  sortOrder: number;
}

export interface PlaylistSchedule {
  enabled: boolean;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  startDate?: string;
  endDate?: string;
}

export interface AIJob {
  id: string;
  clientId?: string;
  type: 'image' | 'video' | 'text' | 'enhance';
  provider: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  assetUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Stats for dashboard
export interface DashboardStats {
  totalClients: number;
  totalContent: number;
  totalRenders: number;
  activeScreens: number;
  recentRenders: RenderJob[];
  screenStatuses: { online: number; offline: number; idle: number };
}
