// ============================================
// Theme Types for RenderFlow Renderer
// ============================================

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent?: string;
  background: string;
  backgroundAlt?: string;
  text: string;
  textMuted?: string;
  textHighlight?: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface FontConfig {
  heading: string;
  body: string;
  accent?: string;
  mono?: string;
}

export interface BrandingConfig {
  colors: ColorScheme;
  fonts: FontConfig;
  logo?: string;
  logoLight?: string;
  logoDark?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface ThemeContext {
  colors: ColorScheme;
  fonts: FontConfig;
  logo: string | null;
  isDark: boolean;
}

export type AspectRatio = 'landscape' | 'portrait' | 'square';

export interface DimensionConfig {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
}

export const DIMENSIONS: Record<AspectRatio, DimensionConfig> = {
  landscape: { width: 1920, height: 1080, aspectRatio: 'landscape' },
  portrait: { width: 1080, height: 1920, aspectRatio: 'portrait' },
  square: { width: 1080, height: 1080, aspectRatio: 'square' },
};

// Default dark theme
export const DEFAULT_COLORS: ColorScheme = {
  primary: '#6366f1',
  secondary: '#a855f7',
  accent: '#22d3ee',
  background: '#0f0f1a',
  backgroundAlt: '#1a1a2e',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textHighlight: '#ffffff',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export const DEFAULT_FONTS: FontConfig = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  accent: 'Playfair Display, serif',
  mono: 'JetBrains Mono, monospace',
};
