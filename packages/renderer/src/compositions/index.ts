// ============================================
// RenderFlow Compositions Index
// ============================================

export { EventPromo } from './EventPromo';
export type { EventPromoProps } from './EventPromo';

export { EventReel } from './EventReel';
export type { EventReelProps, EventItem } from './EventReel';

export { ProductBoard } from './ProductBoard';
export type { ProductBoardProps, ProductItem } from './ProductBoard';

export { StatsDashboard } from './StatsDashboard';
export type { StatsDashboardProps, StatItem } from './StatsDashboard';

export { Branding } from './Branding';
export type { BrandingProps, BrandingEffect } from './Branding';

export { Alert } from './Alert';
export type { AlertProps, AlertLevel } from './Alert';

// Composition metadata for dynamic registration
export const COMPOSITIONS = {
  EventPromo: {
    id: 'EventPromo',
    name: 'Event Promo',
    description: 'Single event spotlight with animated details',
    category: 'promo',
    defaultDuration: 10,
    contentTypes: ['event'],
    formats: ['landscape', 'portrait', 'square'],
  },
  EventReel: {
    id: 'EventReel',
    name: 'Event Reel',
    description: 'Multiple events rotating through with transitions',
    category: 'promo',
    defaultDuration: 30,
    contentTypes: ['event'],
    formats: ['landscape', 'portrait', 'square'],
  },
  ProductBoard: {
    id: 'ProductBoard',
    name: 'Product Board',
    description: 'Menu or product grid display',
    category: 'menu',
    defaultDuration: 15,
    contentTypes: ['product'],
    formats: ['landscape', 'portrait', 'square'],
  },
  StatsDashboard: {
    id: 'StatsDashboard',
    name: 'Stats Dashboard',
    description: 'Animated statistics display with counters',
    category: 'stats',
    defaultDuration: 8,
    contentTypes: ['stat'],
    formats: ['landscape', 'portrait', 'square'],
  },
  Branding: {
    id: 'Branding',
    name: 'Branding',
    description: 'Logo reveal with various effects',
    category: 'branding',
    defaultDuration: 5,
    contentTypes: ['media'],
    formats: ['landscape', 'portrait', 'square'],
  },
  Alert: {
    id: 'Alert',
    name: 'Alert',
    description: 'Announcement or alert banner',
    category: 'alert',
    defaultDuration: 6,
    contentTypes: ['message'],
    formats: ['landscape', 'portrait', 'square'],
  },
} as const;

export type CompositionId = keyof typeof COMPOSITIONS;
