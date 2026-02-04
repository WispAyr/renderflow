# RenderFlow

**Content-to-Screen Platform with AI Enhancement**

Transform structured data into stunning video content and digital signage with intelligent template rendering and AI-powered asset generation.

```
DATA ──→ TEMPLATE ──→ AI LAYER ──→ RENDER ──→ OUTPUT
                                              ├── Screens
                                              ├── Social Media
                                              └── Playlists
```

## Features

- 🏢 **Multi-tenant** — Support multiple clients with isolated branding
- 📝 **Generic Content Model** — Events, products, messages, stats
- 🎨 **Template System** — Reusable, themeable templates with slot-based design
- 🤖 **AI Enhancement** — Auto-generate backgrounds, imagery, and video with Grok, DALL-E, Runway
- 🎬 **Remotion Rendering** — High-quality video output in any format
- 📺 **Screen Management** — Push content to physical displays
- 📱 **Social Export** — Instagram, Facebook, TikTok-ready outputs
- 📋 **Playlist Builder** — Automated content rotation and scheduling

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
│  └─ branding: { colors, fonts, logo, theme }                │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    CONTENT    │     │   TEMPLATES   │     │    OUTPUTS    │
│               │     │               │     │               │
│ • events      │     │ • EventPromo  │     │ • screens     │
│ • products    │     │ • MenuBoard   │     │ • social      │
│ • messages    │     │ • Countdown   │     │ • playlists   │
│ • stats       │     │ • Branding    │     │ • downloads   │
└───────────────┘     └───────────────┘     └───────────────┘
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
              ┌─────────────┐   ┌─────────────┐
              │  AI LAYER   │   │   RENDER    │
              │             │   │             │
              │ • Grok      │   │ • Remotion  │
              │ • DALL-E    │──▶│ • FFmpeg    │
              │ • Runway    │   │ • Sharp     │
              │ • Pika      │   │             │
              └─────────────┘   └─────────────┘
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start development
pnpm dev

# Run API server
pnpm server

# Build for production
pnpm build
```

## Project Structure

```
renderflow/
├── packages/
│   ├── core/           # Shared types, schemas, utilities
│   ├── api/            # REST API server
│   ├── renderer/       # Remotion compositions & render engine
│   ├── ai/             # AI provider integrations
│   ├── web/            # Admin UI (React)
│   └── player/         # Screen player client
├── templates/          # Template definitions
├── docs/               # Documentation
└── examples/           # Example client configs
```

## Data Model

### Content Item

```typescript
interface ContentItem {
  id: string;
  clientId: string;
  type: 'event' | 'product' | 'message' | 'stat' | 'media';
  
  // Universal fields
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  
  // Type-specific
  date?: string;
  time?: string;
  price?: string;
  category?: string;
  tags?: string[];
  
  // AI hints
  mood?: string;
  style?: string;
}
```

### Template

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  
  // Supported content types
  contentTypes: ContentType[];
  
  // Output formats
  formats: {
    landscape: { width: 1920, height: 1080 };
    portrait: { width: 1080, height: 1920 };
    square: { width: 1080, height: 1080 };
  };
  
  // Duration options
  durations: number[];  // seconds
  
  // Slot definitions
  slots: TemplateSlot[];
}
```

### AI Asset Request

```typescript
interface AIAssetRequest {
  type: 'image' | 'video' | 'background';
  
  // Context-derived or explicit
  prompt?: string;
  deriveFrom?: {
    title: string;
    category: string;
    mood?: string;
    style?: string;
  };
  
  dimensions: { width: number; height: number };
  duration?: number;
  provider?: 'grok' | 'dalle' | 'runway' | 'pika';
}
```

## API Endpoints

### Clients
- `GET /api/clients` — List all clients
- `POST /api/clients` — Create client
- `GET /api/clients/:id` — Get client details
- `PUT /api/clients/:id` — Update client
- `DELETE /api/clients/:id` — Delete client

### Content
- `GET /api/content` — List content (filterable)
- `POST /api/content` — Create content item
- `GET /api/content/:id` — Get content item
- `PUT /api/content/:id` — Update content item
- `DELETE /api/content/:id` — Delete content item
- `POST /api/content/import` — Bulk import

### Templates
- `GET /api/templates` — List templates
- `GET /api/templates/:id` — Get template details
- `GET /api/templates/:id/preview` — Preview with sample data

### Render
- `POST /api/render` — Queue a render job
- `GET /api/render/:jobId` — Get job status
- `GET /api/render/:jobId/output` — Download output

### AI
- `POST /api/ai/generate` — Generate asset
- `GET /api/ai/providers` — List available providers

### Screens
- `GET /api/screens` — List screens
- `POST /api/screens/:id/push` — Push content to screen
- `PUT /api/screens/:id/playlist` — Set playlist

### Playlists
- `GET /api/playlists` — List playlists
- `POST /api/playlists` — Create playlist
- `PUT /api/playlists/:id` — Update playlist

## Example: Theatre Client

```typescript
// Create client
const gaiety = await api.clients.create({
  name: 'The Gaiety Theatre',
  branding: {
    colors: {
      primary: '#FFD700',
      secondary: '#8B0000',
      background: '#0a0a0f',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    logo: '/assets/gaiety-logo.png',
  },
});

// Add content
const show = await api.content.create({
  clientId: gaiety.id,
  type: 'event',
  title: 'Carmen',
  subtitle: 'Ukrainian National Opera',
  date: 'Mar 3',
  time: '7:00pm',
  price: '£33-45',
  category: 'opera',
  mood: 'dramatic',
});

// Render with AI enhancement
const job = await api.render.create({
  contentId: show.id,
  templateId: 'event-promo',
  format: 'landscape',
  duration: 10,
  ai: {
    background: {
      derive: true,  // Auto-generate from content
      provider: 'grok',
    },
  },
});

// Push to screen
await api.screens.push('lobby-tv', {
  type: 'video',
  path: job.outputPath,
});
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# AI Providers
GROK_API_KEY=...
OPENAI_API_KEY=...
RUNWAY_API_KEY=...

# Storage
STORAGE_PATH=/data/renderflow
S3_BUCKET=renderflow-assets

# Rendering
REMOTION_CONCURRENCY=2
```

## License

MIT © Local Connect Systems

---

Built with ❤️ for digital signage and content automation.
