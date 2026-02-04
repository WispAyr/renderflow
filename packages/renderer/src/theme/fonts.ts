// ============================================
// Font Loading for RenderFlow
// ============================================

import { continueRender, delayRender } from 'remotion';

// Google Fonts base URL
const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2';

// Common font weights
const FONT_WEIGHTS = '400;500;600;700;800';

// Build Google Fonts URL
export function buildGoogleFontsUrl(fonts: string[]): string {
  const families = fonts
    .map((font) => `family=${encodeURIComponent(font)}:wght@${FONT_WEIGHTS}`)
    .join('&');
  return `${GOOGLE_FONTS_BASE}?${families}&display=swap`;
}

// Load fonts dynamically
export async function loadFonts(fonts: string[]): Promise<void> {
  const url = buildGoogleFontsUrl(fonts);
  
  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  
  return new Promise((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load fonts: ${fonts.join(', ')}`));
    document.head.appendChild(link);
  });
}

// Hook for loading fonts in Remotion
export function useFonts(fonts: string[]): void {
  if (typeof window === 'undefined') return;
  
  const handle = delayRender(`Loading fonts: ${fonts.join(', ')}`);
  
  loadFonts(fonts)
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Font loading failed:', err);
      continueRender(handle);
    });
}

// Common font presets
export const FONT_PRESETS = {
  modern: ['Inter', 'JetBrains Mono'],
  elegant: ['Playfair Display', 'Cormorant Garamond', 'Inter'],
  bold: ['Montserrat', 'Inter'],
  minimal: ['Space Grotesk', 'Inter'],
  tech: ['Orbitron', 'JetBrains Mono', 'Inter'],
} as const;

export type FontPreset = keyof typeof FONT_PRESETS;

export function getFontPreset(preset: FontPreset): string[] {
  return [...FONT_PRESETS[preset]];
}
