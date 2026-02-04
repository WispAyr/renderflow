# @renderflow/renderer

Remotion-based video rendering engine for RenderFlow. Generate dynamic, themeable video content programmatically.

## Features

- **6 Pre-built Compositions**
  - `EventPromo` - Single event spotlight
  - `EventReel` - Multiple events rotating
  - `ProductBoard` - Menu/product display
  - `StatsDashboard` - Animated statistics
  - `Branding` - Logo reveal with effects (reveal, bounce, glitch, spin, particles)
  - `Alert` - Announcement banners (info, success, warning, error, critical, promo)

- **Fully Themeable**
  - Pass client branding (colors, fonts, logo)
  - Dark/light theme support
  - Google Fonts loading

- **Multi-Format**
  - Landscape (1920×1080)
  - Portrait (1080×1920)
  - Square (1080×1080)

- **Render Service**
  - Queue management
  - Progress tracking
  - Thumbnail generation

## Installation

```bash
pnpm add @renderflow/renderer
```

## Usage

### Remotion Studio (Development)

```bash
pnpm run dev
```

### Programmatic Rendering

```typescript
import { renderComposition, initRenderService } from '@renderflow/renderer';

// Initialize with custom config
initRenderService({
  outputDir: './renders',
  concurrency: 2,
});

// Render a composition
const outputPath = await renderComposition({
  compositionId: 'EventPromo',
  inputProps: {
    title: 'Summer Festival 2024',
    date: 'August 15, 2024',
    venue: 'Central Park',
    branding: {
      colors: {
        primary: '#ff6b00',
        secondary: '#ff9500',
        background: '#0a0a0a',
        text: '#ffffff',
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Inter',
      },
      logo: 'https://example.com/logo.png',
    },
  },
  format: 'landscape',
  duration: 10,
  quality: 'high',
});

console.log('Rendered to:', outputPath);
```

### Using the Queue

```typescript
import { createRenderJob, getJob, subscribeToJobProgress } from '@renderflow/renderer';

// Create a job
const job = await createRenderJob({
  compositionId: 'StatsDashboard',
  inputProps: {
    stats: [
      { id: '1', label: 'Users', value: 12453, icon: '👥', trend: 'up' },
      { id: '2', label: 'Revenue', value: 84500, prefix: '$', icon: '💰' },
    ],
    title: 'Monthly Stats',
  },
  format: 'landscape',
});

// Track progress
const unsubscribe = subscribeToJobProgress(job.id, (progress) => {
  console.log(`${progress.status}: ${progress.progress}%`);
  
  if (progress.status === 'completed') {
    const completedJob = getJob(job.id);
    console.log('Output:', completedJob?.outputPath);
    unsubscribe();
  }
});
```

## Compositions

### EventPromo

Single event spotlight with animated details.

```typescript
{
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  venue?: string;
  price?: string;
  category?: string;
  image?: string;
  backgroundImage?: string;
  ctaText?: string;
  website?: string;
  phone?: string;
  branding?: BrandingConfig;
  format?: 'landscape' | 'portrait' | 'square';
}
```

### EventReel

Multiple events rotating with transitions.

```typescript
{
  events: EventItem[];
  title?: string;
  tagline?: string;
  secondsPerEvent?: number;
  branding?: BrandingConfig;
  format?: 'landscape' | 'portrait' | 'square';
}
```

### ProductBoard

Menu or product grid display.

```typescript
{
  products: ProductItem[];
  title?: string;
  subtitle?: string;
  showPrices?: boolean;
  showCalories?: boolean;
  columns?: number;
  branding?: BrandingConfig;
  format?: 'landscape' | 'portrait' | 'square';
}
```

### StatsDashboard

Animated statistics with counters.

```typescript
{
  stats: StatItem[];
  title?: string;
  subtitle?: string;
  showTrends?: boolean;
  animated?: boolean;
  branding?: BrandingConfig;
  format?: 'landscape' | 'portrait' | 'square';
}
```

### Branding

Logo reveal with various effects.

```typescript
{
  logo?: string;
  tagline?: string;
  effect?: 'reveal' | 'bounce' | 'glitch' | 'spin' | 'particles' | 'cinematic';
  branding?: BrandingConfig;
  format?: 'landscape' | 'portrait' | 'square';
}
```

### Alert

Announcement or alert banner.

```typescript
{
  message: string;
  title?: string;
  level?: 'info' | 'success' | 'warning' | 'error' | 'critical' | 'promo';
  icon?: string;
  details?: string;
  ctaText?: string;
  ctaUrl?: string;
  branding?: BrandingConfig;
  format?: 'landscape' | 'portrait' | 'square';
}
```

## Theming

All compositions accept a `branding` prop:

```typescript
interface BrandingConfig {
  colors: {
    primary: string;      // Main brand color
    secondary: string;    // Secondary/accent color
    accent?: string;      // Optional third color
    background: string;   // Background color
    text: string;         // Primary text color
    textMuted?: string;   // Muted/secondary text
  };
  fonts: {
    heading: string;      // Heading font family
    body: string;         // Body text font
    accent?: string;      // Optional display font
    mono?: string;        // Monospace font
  };
  logo?: string;          // Logo URL or static file path
  logoLight?: string;     // Light variant for dark backgrounds
  logoDark?: string;      // Dark variant for light backgrounds
  theme?: 'light' | 'dark' | 'auto';
}
```

## Scripts

- `pnpm dev` - Start Remotion Studio
- `pnpm build` - Build for production
- `pnpm render` - CLI render command

## License

MIT
