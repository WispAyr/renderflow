// ============================================
// RenderFlow Remotion Root
// ============================================

import React from 'react';
import { Composition } from 'remotion';

// Import all compositions
import { EventPromo, EventPromoProps } from './compositions/EventPromo';
import { EventReel, EventReelProps, EventItem } from './compositions/EventReel';
import { ProductBoard, ProductBoardProps, ProductItem } from './compositions/ProductBoard';
import { StatsDashboard, StatsDashboardProps, StatItem } from './compositions/StatsDashboard';
import { Branding, BrandingProps } from './compositions/Branding';
import { Alert, AlertProps } from './compositions/Alert';

import { DIMENSIONS } from './theme';

// Default branding for previews
const DEFAULT_BRANDING = {
  colors: {
    primary: '#6366f1',
    secondary: '#a855f7',
    accent: '#22d3ee',
    background: '#0f0f1a',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
};

// Sample data for previews
const SAMPLE_EVENT: EventPromoProps = {
  title: 'Summer Festival 2024',
  subtitle: 'The biggest event of the year',
  date: 'August 15, 2024',
  time: '6:00 PM',
  venue: 'Central Park Arena',
  price: 'From $49',
  category: 'Festival',
  ctaText: 'Get Tickets',
  website: 'example.com',
  branding: DEFAULT_BRANDING,
};

const SAMPLE_EVENTS: EventItem[] = [
  {
    id: '1',
    title: 'Summer Concert Series',
    subtitle: 'Live music under the stars',
    date: 'July 20, 2024',
    time: '7:00 PM',
    venue: 'Amphitheater',
    category: 'Music',
    price: '$35',
  },
  {
    id: '2',
    title: 'Comedy Night',
    subtitle: 'Featuring top comedians',
    date: 'July 25, 2024',
    time: '8:00 PM',
    venue: 'Main Theatre',
    category: 'Comedy',
    price: '$25',
  },
  {
    id: '3',
    title: 'Art Exhibition',
    subtitle: 'Modern masters collection',
    date: 'Aug 1-15, 2024',
    time: '10:00 AM',
    venue: 'Gallery Hall',
    category: 'Art',
    price: 'Free',
  },
];

const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Angus beef patty with fresh vegetables and special sauce',
    price: '$12.99',
    category: 'Burgers',
    featured: true,
    calories: 650,
    tags: ['Popular', 'Beef'],
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons with classic dressing',
    price: '$9.99',
    category: 'Salads',
    calories: 320,
    tags: ['Healthy', 'Vegetarian'],
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomatoes, and basil on thin crust',
    price: '$14.99',
    category: 'Pizza',
    calories: 780,
    tags: ['Vegetarian'],
  },
  {
    id: '4',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter sauce',
    price: '$18.99',
    category: 'Seafood',
    featured: true,
    calories: 420,
    tags: ['Premium', 'Healthy'],
  },
];

const SAMPLE_STATS: StatItem[] = [
  { id: '1', label: 'Total Users', value: 12453, icon: '👥', trend: 'up', change: 12 },
  { id: '2', label: 'Revenue', value: 84500, prefix: '$', icon: '💰', trend: 'up', change: 8 },
  { id: '3', label: 'Active Projects', value: 156, icon: '📊', trend: 'flat' },
  { id: '4', label: 'Satisfaction', value: 98, suffix: '%', icon: '⭐', trend: 'up', change: 3 },
];

// Register all compositions
export const RemotionRoot: React.FC = () => {
  const FPS = 30;
  
  return (
    <>
      {/* ============ EVENT PROMO ============ */}
      {/* Landscape */}
      <Composition
        id="EventPromo"
        component={EventPromo}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={SAMPLE_EVENT}
      />
      {/* Portrait */}
      <Composition
        id="EventPromo-Portrait"
        component={EventPromo}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={DIMENSIONS.portrait.width}
        height={DIMENSIONS.portrait.height}
        defaultProps={{ ...SAMPLE_EVENT, format: 'portrait' }}
      />
      {/* Square */}
      <Composition
        id="EventPromo-Square"
        component={EventPromo}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={DIMENSIONS.square.width}
        height={DIMENSIONS.square.height}
        defaultProps={{ ...SAMPLE_EVENT, format: 'square' }}
      />

      {/* ============ EVENT REEL ============ */}
      <Composition
        id="EventReel"
        component={EventReel}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          events: SAMPLE_EVENTS,
          title: 'Coming Soon',
          tagline: "Don't miss out",
          branding: DEFAULT_BRANDING,
        } as EventReelProps}
      />
      <Composition
        id="EventReel-Portrait"
        component={EventReel}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={DIMENSIONS.portrait.width}
        height={DIMENSIONS.portrait.height}
        defaultProps={{
          events: SAMPLE_EVENTS,
          title: 'Coming Soon',
          format: 'portrait',
          branding: DEFAULT_BRANDING,
        } as EventReelProps}
      />

      {/* ============ PRODUCT BOARD ============ */}
      <Composition
        id="ProductBoard"
        component={ProductBoard}
        durationInFrames={15 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          products: SAMPLE_PRODUCTS,
          title: 'Our Menu',
          subtitle: 'Fresh ingredients, amazing taste',
          showPrices: true,
          showCalories: true,
          branding: DEFAULT_BRANDING,
        } as ProductBoardProps}
      />
      <Composition
        id="ProductBoard-Portrait"
        component={ProductBoard}
        durationInFrames={15 * FPS}
        fps={FPS}
        width={DIMENSIONS.portrait.width}
        height={DIMENSIONS.portrait.height}
        defaultProps={{
          products: SAMPLE_PRODUCTS,
          title: 'Our Menu',
          format: 'portrait',
          branding: DEFAULT_BRANDING,
        } as ProductBoardProps}
      />

      {/* ============ STATS DASHBOARD ============ */}
      <Composition
        id="StatsDashboard"
        component={StatsDashboard}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          stats: SAMPLE_STATS,
          title: 'Live Statistics',
          subtitle: 'Real-time performance metrics',
          showTrends: true,
          animated: true,
          branding: DEFAULT_BRANDING,
        } as StatsDashboardProps}
      />
      <Composition
        id="StatsDashboard-Portrait"
        component={StatsDashboard}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={DIMENSIONS.portrait.width}
        height={DIMENSIONS.portrait.height}
        defaultProps={{
          stats: SAMPLE_STATS.slice(0, 4),
          title: 'Statistics',
          format: 'portrait',
          branding: DEFAULT_BRANDING,
        } as StatsDashboardProps}
      />

      {/* ============ BRANDING ============ */}
      {/* Logo Reveal */}
      <Composition
        id="Branding-Reveal"
        component={Branding}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          tagline: 'Your brand tagline',
          effect: 'reveal',
          branding: DEFAULT_BRANDING,
        } as BrandingProps}
      />
      {/* Logo Bounce */}
      <Composition
        id="Branding-Bounce"
        component={Branding}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          tagline: 'Your brand tagline',
          effect: 'bounce',
          branding: DEFAULT_BRANDING,
        } as BrandingProps}
      />
      {/* Logo Glitch */}
      <Composition
        id="Branding-Glitch"
        component={Branding}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          tagline: 'Your brand tagline',
          effect: 'glitch',
          branding: DEFAULT_BRANDING,
        } as BrandingProps}
      />
      {/* Logo Spin */}
      <Composition
        id="Branding-Spin"
        component={Branding}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          tagline: 'Your brand tagline',
          effect: 'spin',
          branding: DEFAULT_BRANDING,
        } as BrandingProps}
      />
      {/* Logo Particles */}
      <Composition
        id="Branding-Particles"
        component={Branding}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          tagline: 'Your brand tagline',
          effect: 'particles',
          branding: DEFAULT_BRANDING,
        } as BrandingProps}
      />

      {/* ============ ALERTS ============ */}
      {/* Info Alert */}
      <Composition
        id="Alert-Info"
        component={Alert}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          title: 'Notice',
          message: 'System maintenance scheduled for tonight',
          level: 'info',
          details: 'Services will be unavailable from 2 AM to 4 AM EST',
          branding: DEFAULT_BRANDING,
        } as AlertProps}
      />
      {/* Success Alert */}
      <Composition
        id="Alert-Success"
        component={Alert}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          title: 'Success',
          message: 'Your order has been confirmed!',
          level: 'success',
          ctaText: 'Track Order',
          branding: DEFAULT_BRANDING,
        } as AlertProps}
      />
      {/* Warning Alert */}
      <Composition
        id="Alert-Warning"
        component={Alert}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          title: 'Warning',
          message: 'Weather advisory in effect',
          level: 'warning',
          details: 'Heavy rain expected this afternoon',
          branding: DEFAULT_BRANDING,
        } as AlertProps}
      />
      {/* Error Alert */}
      <Composition
        id="Alert-Error"
        component={Alert}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          title: 'Error',
          message: 'Service temporarily unavailable',
          level: 'error',
          details: 'We are working to resolve this issue',
          branding: DEFAULT_BRANDING,
        } as AlertProps}
      />
      {/* Critical Alert */}
      <Composition
        id="Alert-Critical"
        component={Alert}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          title: 'Emergency',
          message: 'Building evacuation in progress',
          level: 'critical',
          details: 'Please proceed to the nearest exit immediately',
          branding: DEFAULT_BRANDING,
        } as AlertProps}
      />
      {/* Promo Alert */}
      <Composition
        id="Alert-Promo"
        component={Alert}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={DIMENSIONS.landscape.width}
        height={DIMENSIONS.landscape.height}
        defaultProps={{
          title: 'Special Offer',
          message: '50% Off This Weekend Only!',
          level: 'promo',
          ctaText: 'Shop Now',
          ctaUrl: 'shop.example.com',
          branding: DEFAULT_BRANDING,
        } as AlertProps}
      />
      {/* Portrait Alert */}
      <Composition
        id="Alert-Portrait"
        component={Alert}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={DIMENSIONS.portrait.width}
        height={DIMENSIONS.portrait.height}
        defaultProps={{
          message: 'Flash Sale Starts Now!',
          level: 'promo',
          ctaText: 'Shop Now',
          format: 'portrait',
          branding: DEFAULT_BRANDING,
        } as AlertProps}
      />
    </>
  );
};
