# PromptGen - AI Prompt Generator

## 📖 Documentation

Dokumentasi lengkap untuk aplikasi PromptGen, sebuah AI Prompt Generator yang berjalan sepenuhnya di sisi client.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Arsitektur Aplikasi](#arsitektur-aplikasi)
4. [Struktur Direktori](#struktur-direktori)
5. [Routes & Pages](#routes--pages)
6. [Backend / API Integration](#backend--api-integration)
7. [Custom Hooks](#custom-hooks)
8. [Prompt Templates](#prompt-templates)
9. [Creativity System](#creativity-system)
10. [Data Storage](#data-storage)
11. [Fitur Export](#fitur-export)
12. [Design System](#design-system)
13. [Components](#components)
14. [Security](#security)
15. [Development Guide](#development-guide)
16. [Deployment](#deployment)
17. [Troubleshooting](#troubleshooting)
18. [API Reference](#api-reference)

---

## Overview

**PromptGen** adalah aplikasi web untuk menghasilkan prompt AI yang optimal untuk berbagai keperluan seperti image generation, video generation, social media, code, music, dan lainnya.

### Fitur Utama

- 🎨 **12 Jenis Prompt Template** - Image, Video, Social, 3D, Chat, Code, Music, Writing, Marketing, Email, Art, Custom
- 🖼️ **8 Image Styles** - General, Realistic, Anime, 3D Render, Painting, Photography, Illustration, Pixel Art
- 🎬 **7 Video Styles** - General, Cinematic, Animation, Slow Motion, Documentary, Music Video, Time-lapse
- 🔧 **Multi-Provider Support** - OpenAI, Google Gemini, OpenRouter, Groq, Custom
- 📊 **Creativity Levels** - 5 level kreativitas dengan parameter yang dapat disesuaikan
- 💾 **Prompt History** - Simpan dan kelola riwayat prompt dengan fitur favorit
- 📤 **Export** - Export history sebagai JSON atau TXT
- 🎯 **Open Access** - Tidak memerlukan login, semua proses di client-side

### Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │  localStorage│  │   API Integration   │  │
│  │   Frontend  │  │   Storage   │  │   (Direct Calls)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External AI Providers                     │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  OpenAI  │  Gemini  │ OpenRouter│   Groq   │     Custom      │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | - | Type Safety |
| Vite | - | Build Tool & Dev Server |
| Tailwind CSS | - | Styling |
| tailwindcss-animate | 1.0.7 | Animation Utilities |
| Framer Motion | 12.24.11 | Advanced Animations |
| React Router DOM | 6.30.1 | Client-side Routing |
| TanStack Query | 5.83.0 | Server State Management |

### UI Components

| Library | Purpose |
|---------|---------|
| Radix UI | Headless UI Primitives |
| shadcn/ui | Pre-built Components |
| Lucide React | Icon Library |
| class-variance-authority | Component Variants |
| clsx + tailwind-merge | Class Utilities |

### Additional Libraries

| Library | Purpose |
|---------|---------|
| next-themes | Theme Management |
| sonner | Toast Notifications |
| react-hook-form + zod | Form Validation |
| date-fns | Date Utilities |
| recharts | Charts (if needed) |

---

## Arsitektur Aplikasi

### State Management

```
┌─────────────────────────────────────────────────────────────┐
│                      Application State                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────────────────┐   │
│  │   React State    │    │      localStorage            │   │
│  │   (Component)    │    │                              │   │
│  ├──────────────────┤    ├──────────────────────────────┤   │
│  │ - Form inputs    │    │ - API Keys                   │   │
│  │ - UI state       │    │ - Selected Provider/Model    │   │
│  │ - Loading states │    │ - Custom Models              │   │
│  │ - Error states   │    │ - Prompt History             │   │
│  └──────────────────┘    │ - Sidebar State              │   │
│                          └──────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              TanStack Query Cache                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ - API Response Caching                                │   │
│  │ - Background Refetching                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Form State → API Call → AI Provider → Response → History → localStorage
     ↑                                                              │
     └──────────────────────────────────────────────────────────────┘
                              (Recall from history)
```

---

## Struktur Direktori

```
promptgen/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx      # Sidebar navigation dengan menu
│   │   │   └── MainLayout.tsx      # Layout wrapper dengan sidebar
│   │   ├── prompt/
│   │   │   ├── DecorativeShapes.tsx # Elemen dekoratif geometris
│   │   │   └── PromptHistoryPanel.tsx # Panel riwayat prompt
│   │   └── ui/                      # shadcn/ui components
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── animated-sidebar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx
│   │       ├── slider.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── tooltip.tsx
│   │       └── ... (50+ components)
│   ├── hooks/
│   │   ├── use-mobile.tsx          # Mobile breakpoint detection
│   │   ├── use-toast.ts            # Toast hook (shadcn)
│   │   ├── useApiKey.ts            # API key management
│   │   ├── useClickSound.ts        # Audio feedback
│   │   ├── useCustomModels.ts      # Custom model CRUD
│   │   ├── useModels.ts            # Fetch models from API
│   │   └── usePromptHistory.ts    # Prompt history management
│   ├── lib/
│   │   ├── generatePrompt.ts       # Core prompt generation logic
│   │   ├── promptTemplates.ts      # Template definitions
│   │   └── utils.ts                # Utility functions (cn, etc.)
│   ├── pages/
│   │   ├── NotFound.tsx            # 404 page
│   │   ├── PromptGenerator.tsx    # Main generator page
│   │   └── Settings.tsx            # Settings page
│   ├── App.css                     # Additional styles
│   ├── App.tsx                     # Root component
│   ├── index.css                   # Global styles & design tokens
│   ├── main.tsx                    # Entry point
│   └── vite-env.d.ts               # Vite type definitions
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── DOCS.md                         # This file
```

---

## Routes & Pages

### Route Configuration

```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<PromptGenerator />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Pages Detail

#### 1. PromptGenerator (`/`)

**File:** `src/pages/PromptGenerator.tsx`

Halaman utama untuk generate prompt.

**Fitur:**
- Input deskripsi prompt
- Pilihan jenis prompt (berdasarkan menu sidebar)
- Pilihan style (untuk Image/Video)
- Slider creativity level (1-5)
- Tombol generate
- Output area dengan copy functionality
- Panel riwayat prompt

**State:**
```typescript
interface PromptGeneratorState {
  userInput: string;           // User description
  generatedPrompt: string;     // AI-generated result
  isLoading: boolean;          // Loading state
  creativityLevel: number;     // 1-5
  selectedStyle: string;       // Style for image/video
}
```

#### 2. Settings (`/settings`)

**File:** `src/pages/Settings.tsx`

Halaman konfigurasi API dan model.

**Fitur:**
- Pilihan API Provider (OpenAI, Gemini, OpenRouter, Groq, Custom)
- Input API Key (masked)
- Custom Base URL (untuk Custom provider)
- Model selection dropdown
- Custom model management (Create/Edit/Delete)
- Test connection button

**State:**
```typescript
interface SettingsState {
  provider: ApiProvider;
  apiKey: string;
  customBaseUrl: string;
  selectedModel: string;
  customModels: CustomModel[];
}
```

#### 3. NotFound (`/404`)

**File:** `src/pages/NotFound.tsx`

Halaman 404 untuk route yang tidak ditemukan.

---

## Backend / API Integration

### Supported Providers

| Provider | ID | Base URL | Documentation |
|----------|-----|----------|---------------|
| OpenAI | `openai` | `https://api.openai.com/v1` | [docs.openai.com](https://platform.openai.com/docs) |
| Google Gemini | `gemini` | `https://generativelanguage.googleapis.com/v1beta` | [ai.google.dev](https://ai.google.dev/docs) |
| OpenRouter | `openrouter` | `https://openrouter.ai/api/v1` | [openrouter.ai/docs](https://openrouter.ai/docs) |
| Groq | `groq` | `https://api.groq.com/openai/v1` | [console.groq.com](https://console.groq.com/docs) |
| Custom | `custom` | User-defined | - |

### API Endpoints

#### 1. Fetch Models

**Endpoint:** `GET /models`

**Purpose:** Mendapatkan daftar model yang tersedia

**Request:**
```http
GET /models
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Response (OpenAI format):**
```json
{
  "data": [
    { "id": "gpt-4o", "name": "GPT-4o" },
    { "id": "gpt-4o-mini", "name": "GPT-4o Mini" },
    { "id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo" }
  ]
}
```

**Response (OpenRouter format):**
```json
{
  "data": [
    { "id": "openai/gpt-4o", "name": "OpenAI: GPT-4o" },
    { "id": "anthropic/claude-3", "name": "Anthropic: Claude 3" }
  ]
}
```

#### 2. Generate Prompt (Chat Completions)

**Endpoint:** `POST /chat/completions`

**Purpose:** Generate prompt menggunakan AI

**Request:**
```http
POST /chat/completions
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert AI prompt engineer..."
    },
    {
      "role": "user",
      "content": "Create an image prompt for: a sunset over mountains"
    }
  ],
  "max_tokens": 500,
  "temperature": 0.7,
  "top_p": 0.9,
  "top_k": 40
}
```

**Response:**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "A breathtaking panoramic view of..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

### Provider-Specific Handling

#### Google Gemini

```typescript
// Special endpoint structure
const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

// For models endpoint
const modelsUrl = `${baseUrl}/models?key=${apiKey}`;

// For chat completions (OpenAI-compatible endpoint)
const chatUrl = `${baseUrl}/openai/chat/completions`;
```

#### OpenRouter

```typescript
// Additional headers required
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'HTTP-Referer': window.location.origin,
  'X-Title': 'PromptGen'
}
```

### Error Handling

```typescript
interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// Common error codes
const ERROR_CODES = {
  401: 'Invalid API key',
  403: 'Access forbidden',
  404: 'Model not found',
  429: 'Rate limit exceeded',
  500: 'Server error',
  503: 'Service unavailable'
};
```

---

## Custom Hooks

### useApiKey

**File:** `src/hooks/useApiKey.ts`

Mengelola API keys untuk berbagai provider.

```typescript
interface UseApiKeyReturn {
  apiKey: string;
  setApiKey: (key: string) => void;
  provider: ApiProvider;
  setProvider: (provider: ApiProvider) => void;
  model: string;
  setModel: (model: string) => void;
  customBaseUrl: string;
  setCustomBaseUrl: (url: string) => void;
  selectedCustomModel: string | null;
  setSelectedCustomModel: (id: string | null) => void;
  getApiKeyForProvider: (provider: ApiProvider) => string;
}

type ApiProvider = 'openai' | 'gemini' | 'openrouter' | 'groq' | 'custom';
```

**localStorage Keys:**
- `promptgen_api_keys` - Object mapping provider to API key
- `promptgen_api_provider` - Selected provider
- `promptgen_api_model` - Selected model
- `promptgen_selected_custom_model` - Custom model ID

### useModels

**File:** `src/hooks/useModels.ts`

Fetch dan manage daftar model dari API.

```typescript
interface ModelInfo {
  id: string;
  name: string;
}

interface UseModelsReturn {
  models: ModelInfo[];
  isLoading: boolean;
  error: string | null;
  fetchModels: (provider: ApiProvider, apiKey: string, customBaseUrl?: string) => Promise<void>;
}
```

### useCustomModels

**File:** `src/hooks/useCustomModels.ts`

CRUD operations untuk custom model configurations.

```typescript
interface CustomModel {
  id: string;
  name: string;
  baseUrl: string;
  modelId: string;
  apiKey?: string;
}

interface UseCustomModelsReturn {
  customModels: CustomModel[];
  addCustomModel: (model: Omit<CustomModel, 'id'>) => void;
  updateCustomModel: (id: string, model: Partial<CustomModel>) => void;
  deleteCustomModel: (id: string) => void;
  getCustomModel: (id: string) => CustomModel | undefined;
}
```

### usePromptHistory

**File:** `src/hooks/usePromptHistory.ts`

Manage riwayat prompt dengan fitur favorit.

```typescript
interface PromptHistoryItem {
  id: string;
  type: string;
  style?: string;
  input: string;
  output: string;
  timestamp: number;
  isFavorite: boolean;
}

interface UsePromptHistoryReturn {
  history: PromptHistoryItem[];
  addToHistory: (item: Omit<PromptHistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
  removeFromHistory: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  exportHistory: (format: 'json' | 'txt', favoritesOnly?: boolean) => void;
}
```

**localStorage Key:** `promptgen_history`

**Max Items:** 50 (oldest non-favorite items removed first)

### useClickSound

**File:** `src/hooks/useClickSound.ts`

Audio feedback untuk interaksi UI.

```typescript
interface UseClickSoundReturn {
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
}
```

### use-mobile

**File:** `src/hooks/use-mobile.tsx`

Detect mobile breakpoint.

```typescript
function useIsMobile(): boolean;
// Returns true if viewport width < 768px
```

---

## Prompt Templates

### Template Types

| Type | Description | Icon |
|------|-------------|------|
| `image` | Image generation prompts | Image |
| `video` | Video generation prompts | Video |
| `social` | Social media content | Share2 |
| `3d` | 3D model generation | Box |
| `chat` | Chatbot prompts | MessageSquare |
| `code` | Code generation | Code |
| `music` | Music/audio generation | Music |
| `writing` | Creative writing | PenTool |
| `marketing` | Marketing copy | Target |
| `email` | Email templates | Mail |
| `art` | Artistic prompts | Palette |
| `custom` | Custom/freeform | Sparkles |

### Image Styles

| Style | ID | Description | Icon |
|-------|-----|-------------|------|
| General | `general` | Default versatile style | Layers |
| Realistic | `realistic` | Photorealistic imagery | Eye |
| Anime | `anime` | Japanese anime style | Sparkles |
| 3D Render | `3d` | 3D rendered graphics | Box |
| Painting | `painting` | Traditional painting styles | Palette |
| Photography | `photography` | Professional photography | Camera |
| Illustration | `illustration` | Digital illustration | PenTool |
| Pixel Art | `pixel` | Retro pixel art | Grid3X3 |

### Video Styles

| Style | ID | Description | Icon |
|-------|-----|-------------|------|
| General | `general` | Default video style | Clapperboard |
| Cinematic | `cinematic` | Film-like quality | Film |
| Animation | `animation` | Animated content | Sparkles |
| Slow Motion | `slowmo` | Slow motion effects | Clock |
| Documentary | `documentary` | Documentary style | FileVideo |
| Music Video | `musicvideo` | Music video aesthetics | Music |
| Time-lapse | `timelapse` | Time-lapse footage | Timer |

### Template Structure

```typescript
// src/lib/promptTemplates.ts

const promptTemplates: Record<string, string> = {
  image: `You are an expert AI image prompt engineer...

User wants to create: {input}

Generate a detailed, vivid prompt that includes:
- Subject description
- Art style and medium
- Lighting and atmosphere
- Color palette
- Composition details
- Technical specifications`,

  video: `You are an expert AI video prompt engineer...

User wants to create: {input}

Generate a detailed, vivid video prompt that includes:
- Scene description
- Cinematography style
- Motion and pacing
- Color grading
- Sound and music cues
- Technical details`,

  social: `You are an expert social media content creator...

User wants to create: {input}

Generate engaging social media post content including:
- Catchy headline
- Hashtags
- Call to action
- Tone and style`,

  '3d': `You are an expert 3D model prompt engineer...

User wants to create: {input}

Generate a detailed 3D model prompt including:
- Object description
- Materials and textures
- Lighting
- Style and rendering details`,

  chat: `You are an expert chatbot prompt engineer...

User wants to create: {input}

Generate a conversational prompt including:
- Context
- User intent
- Expected responses
- Tone and style`,

  code: `You are an expert code generation prompt engineer...

User wants to create: {input}

Generate a detailed coding prompt including:
- Language
- Functionality
- Constraints
- Examples`,

  music: `You are an expert music prompt engineer...

User wants to create: {input}

Generate a detailed music prompt including:
- Genre
- Instruments
- Mood
- Tempo`,

  writing: `You are an expert creative writing prompt engineer...

User wants to create: {input}

Generate a detailed writing prompt including:
- Genre
- Characters
- Setting
- Plot ideas`,

  marketing: `You are an expert marketing copywriter...

User wants to create: {input}

Generate persuasive marketing copy including:
- Value proposition
- Target audience
- Call to action`,

  email: `You are an expert email copywriter...

User wants to create: {input}

Generate professional email content including:
- Subject line
- Greeting
- Body
- Closing`,

  art: `You are an expert art prompt engineer...

User wants to create: {input}

Generate an artistic prompt including:
- Style
- Medium
- Mood
- Composition`,

  custom: `You are an expert AI prompt engineer...

User wants to create: {input}

Generate a detailed prompt based on the input.`
};

function getPromptTemplate(type: string, userInput: string): string {
  const template = promptTemplates[type] || promptTemplates.custom;
  return template.replace('{input}', userInput);
}
```

---

## Creativity System

### Creativity Levels

| Level | Name | Temperature | Top-P | Top-K | Description |
|-------|------|-------------|-------|-------|-------------|
| 1 | Conservative | 0.3 | 0.7 | 20 | Very focused, predictable output |
| 2 | Balanced-Low | 0.5 | 0.8 | 30 | Slightly more variation |
| 3 | Balanced | 0.7 | 0.9 | 40 | Good balance of creativity |
| 4 | Creative | 0.9 | 0.95 | 60 | More experimental outputs |
| 5 | Experimental | 1.2 | 1.0 | 100 | Maximum creativity, unpredictable |

### Implementation

```typescript
// src/lib/generatePrompt.ts

interface CreativityParams {
  temperature: number;
  top_p: number;
  top_k: number;
}

function getCreativityParams(level: number): CreativityParams {
  const params: Record<number, CreativityParams> = {
    1: { temperature: 0.3, top_p: 0.7, top_k: 20 },
    2: { temperature: 0.5, top_p: 0.8, top_k: 30 },
    3: { temperature: 0.7, top_p: 0.9, top_k: 40 },
    4: { temperature: 0.9, top_p: 0.95, top_k: 60 },
    5: { temperature: 1.2, top_p: 1.0, top_k: 100 }
  };
  return params[level] || params[3];
}
```

### Parameter Explanation

- **Temperature**: Controls randomness. Higher = more random/creative
- **Top-P (Nucleus Sampling)**: Probability mass for token selection
- **Top-K**: Number of top tokens to consider

---

## Data Storage

### localStorage Schema

```typescript
interface LocalStorageSchema {
  // API Configuration
  'promptgen_api_keys': Record<ApiProvider, string>;
  'promptgen_api_provider': ApiProvider;
  'promptgen_api_model': string;
  'promptgen_selected_custom_model': string | null;
  'promptgen_custom_models': CustomModel[];

  // History
  'promptgen_history': PromptHistoryItem[];

  // UI State
  'sidebar-open': boolean;
}
```

### Data Examples

```javascript
// API Keys (encrypted in production)
localStorage.setItem('promptgen_api_keys', JSON.stringify({
  openai: 'sk-xxx...',
  gemini: 'AIza...',
  openrouter: 'sk-or-xxx...',
  groq: 'gsk_xxx...',
  custom: ''
}));

// Prompt History
localStorage.setItem('promptgen_history', JSON.stringify([
  {
    id: 'uuid-xxx',
    type: 'image',
    style: 'realistic',
    input: 'a cat sitting on a windowsill',
    output: 'A photorealistic image of a fluffy orange tabby cat...',
    timestamp: 1704067200000,
    isFavorite: true
  }
]));

// Custom Models
localStorage.setItem('promptgen_custom_models', JSON.stringify([
  {
    id: 'uuid-xxx',
    name: 'Local LLaMA',
    baseUrl: 'http://localhost:11434/v1',
    modelId: 'llama2',
    apiKey: ''
  }
]));
```

---

## Fitur Export

### Export Formats

#### JSON Export

```typescript
function exportAsJSON(history: PromptHistoryItem[], favoritesOnly: boolean): void {
  const data = favoritesOnly 
    ? history.filter(item => item.isFavorite)
    : history;
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  downloadFile(blob, `promptgen-history-${Date.now()}.json`);
}
```

**Output:**
```json
[
  {
    "id": "abc123",
    "type": "image",
    "style": "anime",
    "input": "a magical forest",
    "output": "An enchanting anime-style illustration...",
    "timestamp": 1704067200000,
    "isFavorite": true
  }
]
```

#### TXT Export

```typescript
function exportAsTXT(history: PromptHistoryItem[], favoritesOnly: boolean): void {
  const data = favoritesOnly 
    ? history.filter(item => item.isFavorite)
    : history;
  
  const text = data.map(item => `
=== ${item.type.toUpperCase()} ${item.style ? `(${item.style})` : ''} ===
Date: ${new Date(item.timestamp).toLocaleString()}
Favorite: ${item.isFavorite ? 'Yes' : 'No'}

INPUT:
${item.input}

OUTPUT:
${item.output}

${'='.repeat(50)}
`).join('\n');

  const blob = new Blob([text], { type: 'text/plain' });
  downloadFile(blob, `promptgen-history-${Date.now()}.txt`);
}
```

---

## Design System

### Theme: Playful Geometric

Tema Memphis-inspired dengan elemen geometris yang playful.

### Color Palette

```css
/* Primary Colors */
--primary: 271 91% 65%;           /* Purple - #A855F7 */
--primary-foreground: 0 0% 100%;

/* Secondary Colors */
--secondary: 330 81% 60%;          /* Pink - #EC4899 */
--tertiary: 45 93% 58%;            /* Yellow - #FBBF24 */
--quaternary: 160 84% 39%;         /* Green - #10B981 */

/* Background & Surface */
--background: 270 50% 98%;
--card: 0 0% 100%;
--muted: 270 30% 96%;

/* Borders & Shadows */
--border: 270 20% 90%;
--ring: 271 91% 65%;

/* Hard Shadow System */
--shadow-hard: 4px 4px 0px;
--shadow-hard-lg: 6px 6px 0px;
```

### Typography

```css
/* Font Families */
--font-heading: 'Outfit', sans-serif;
--font-body: 'Plus Jakarta Sans', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

### Border Radius

```css
--radius: 0.75rem;        /* Default */
--radius-sm: 0.5rem;      /* Small */
--radius-lg: 1rem;        /* Large */
--radius-full: 9999px;    /* Pill */
```

### Animation Classes

```css
/* Custom Animations */
.animate-bounce-slow { animation: bounce 2s infinite; }
.animate-wiggle { animation: wiggle 0.3s ease-in-out; }
.animate-scale-up { animation: scale-up 0.2s ease-out; }

/* Keyframes */
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
```

---

## Components

### Layout Components

#### MainLayout

```typescript
// src/components/layout/MainLayout.tsx
interface MainLayoutProps {
  children: React.ReactNode;
}

// Provides:
// - Responsive sidebar
// - Mobile sheet navigation
// - Content area with proper spacing
```

#### AppSidebar

```typescript
// src/components/layout/AppSidebar.tsx
interface AppSidebarProps {
  activeMenu: string;
  activeStyle: string;
  onMenuChange: (menu: string) => void;
  onStyleChange: (style: string) => void;
}

// Features:
// - Collapsible menu sections
// - Animated icons with hover effects
// - Active state indicators
// - Mobile-responsive
```

### Prompt Components

#### PromptHistoryPanel

```typescript
// src/components/prompt/PromptHistoryPanel.tsx
interface PromptHistoryPanelProps {
  history: PromptHistoryItem[];
  onSelect: (item: PromptHistoryItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExport: (format: 'json' | 'txt', favoritesOnly: boolean) => void;
  onClear: () => void;
}
```

#### DecorativeShapes

```typescript
// src/components/prompt/DecorativeShapes.tsx
// Renders animated geometric shapes for visual interest
// Uses Framer Motion for animations
```

### UI Components (shadcn/ui)

Key customized components:

| Component | Customizations |
|-----------|---------------|
| Button | Hard shadow variants, playful colors |
| Card | Geometric borders, shadow effects |
| Input | Focus ring with primary color |
| Select | Custom dropdown styling |
| Slider | Colorful track and thumb |
| Tabs | Pill-style active indicator |
| Toast | Playful animations |

---

## Security

### API Key Storage

```typescript
// Keys are stored in localStorage (client-side only)
// NEVER sent to any backend server
// All API calls made directly from browser to provider

// Storage pattern
const saveApiKey = (provider: string, key: string) => {
  const keys = JSON.parse(localStorage.getItem('promptgen_api_keys') || '{}');
  keys[provider] = key;
  localStorage.setItem('promptgen_api_keys', JSON.stringify(keys));
};
```

### Security Considerations

1. **Client-Side Only**
   - No server-side storage of API keys
   - Keys remain in user's browser

2. **Direct API Calls**
   - Requests go directly to AI providers
   - No intermediary servers

3. **HTTPS Only**
   - All API endpoints use HTTPS
   - Encrypted in transit

4. **No Analytics/Tracking**
   - No third-party analytics
   - No data collection

### Best Practices

```typescript
// ✅ DO: Use environment-specific keys
// User provides their own API key

// ❌ DON'T: Hardcode API keys
// const API_KEY = 'sk-xxx'; // NEVER DO THIS

// ✅ DO: Validate input
const sanitizeInput = (input: string): string => {
  return input.trim().slice(0, 10000); // Limit length
};

// ✅ DO: Handle errors gracefully
try {
  const response = await generatePrompt(input);
} catch (error) {
  // Don't expose internal errors to users
  toast.error('Failed to generate prompt. Please try again.');
}
```

---

## Development Guide

### Prerequisites

- Node.js 18+
- npm or bun

### Setup

```bash
# Clone repository
git clone <repository-url>
cd promptgen

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Adding New Prompt Type

1. **Add template in `promptTemplates.ts`:**

```typescript
export const promptTemplates = {
  // ... existing templates
  newType: `You are an expert at creating {type} prompts...

User input: {input}

Create a detailed prompt that...`
};
```

2. **Add menu item in `AppSidebar.tsx`:**

```typescript
const mainMenus = [
  // ... existing menus
  {
    id: 'newType',
    label: 'New Type',
    icon: NewIcon,
    styles: [] // Optional sub-styles
  }
];
```

3. **Update type definitions if needed**

### Adding New AI Provider

1. **Update types in `useApiKey.ts`:**

```typescript
type ApiProvider = 'openai' | 'gemini' | 'openrouter' | 'groq' | 'custom' | 'newProvider';
```

2. **Add provider config in `useModels.ts`:**

```typescript
const providerConfigs = {
  // ... existing configs
  newProvider: {
    baseUrl: 'https://api.newprovider.com/v1',
    modelsEndpoint: '/models',
    authHeader: 'Authorization'
  }
};
```

3. **Update Settings UI to include new provider option**

---

## Deployment

### Static Hosting

PromptGen is a static frontend application. Deploy to any static hosting:

#### Vercel

```bash
npm run build
# Deploy dist/ folder
```

#### Netlify

```bash
npm run build
# Deploy dist/ folder
# Or connect Git repository for auto-deploy
```

#### GitHub Pages

```bash
npm run build
# Push dist/ to gh-pages branch
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── robots.txt
```

### Environment Variables

No environment variables required! All configuration is done through the UI.

### CORS Considerations

API providers handle CORS. If using custom endpoints:

```typescript
// Custom endpoint must include CORS headers:
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error

**Cause:** API key is incorrect or expired

**Solution:**
```
1. Go to Settings
2. Re-enter your API key
3. Click "Test Connection"
4. Ensure key has proper permissions
```

#### 2. "Model Not Found" Error

**Cause:** Selected model not available for your account

**Solution:**
```
1. Fetch available models first
2. Select a model from the dropdown
3. Some models require specific API access tiers
```

#### 3. CORS Error

**Cause:** Browser blocking cross-origin request

**Solution:**
```
1. Ensure you're using HTTPS
2. Check if provider supports browser-based requests
3. For custom endpoints, configure CORS headers
```

#### 4. Rate Limit Exceeded

**Cause:** Too many requests to API

**Solution:**
```
1. Wait a few minutes before retrying
2. Reduce request frequency
3. Upgrade API plan if needed
```

#### 5. Empty Response

**Cause:** Model returned empty or malformed response

**Solution:**
```
1. Try regenerating
2. Adjust creativity level
3. Simplify input prompt
4. Try different model
```

### Debug Mode

Open browser console for debug information:

```javascript
// View stored data
console.log(localStorage.getItem('promptgen_history'));
console.log(localStorage.getItem('promptgen_api_keys'));

// Clear all data
localStorage.clear();
```

---

## API Reference

### generatePrompt Function

```typescript
// src/lib/generatePrompt.ts

interface GeneratePromptOptions {
  type: string;
  style?: string;
  input: string;
  creativityLevel: number;
  provider: ApiProvider;
  apiKey: string;
  model: string;
  customBaseUrl?: string;
}

interface GeneratePromptResult {
  success: boolean;
  prompt?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

async function generatePrompt(
  options: GeneratePromptOptions
): Promise<GeneratePromptResult>;
```

### getPromptTemplate Function

```typescript
// src/lib/promptTemplates.ts

function getPromptTemplate(
  type: string, 
  userInput: string
): string;

// Returns formatted prompt template with user input inserted
```

### Hook Return Types

```typescript
// useApiKey
type UseApiKeyReturn = {
  apiKey: string;
  setApiKey: (key: string) => void;
  provider: ApiProvider;
  setProvider: (provider: ApiProvider) => void;
  model: string;
  setModel: (model: string) => void;
  customBaseUrl: string;
  setCustomBaseUrl: (url: string) => void;
  selectedCustomModel: string | null;
  setSelectedCustomModel: (id: string | null) => void;
  getApiKeyForProvider: (provider: ApiProvider) => string;
};

// useModels
type UseModelsReturn = {
  models: ModelInfo[];
  isLoading: boolean;
  error: string | null;
  fetchModels: (
    provider: ApiProvider, 
    apiKey: string, 
    customBaseUrl?: string
  ) => Promise<void>;
};

// usePromptHistory
type UsePromptHistoryReturn = {
  history: PromptHistoryItem[];
  addToHistory: (item: Omit<PromptHistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
  removeFromHistory: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  exportHistory: (format: 'json' | 'txt', favoritesOnly?: boolean) => void;
};
```

---

## Changelog

### Version 1.0.0

- Initial release
- 12 prompt template types
- 8 image styles
- 7 video styles
- Multi-provider support (OpenAI, Gemini, OpenRouter, Groq, Custom)
- Prompt history with favorites
- Export functionality (JSON/TXT)
- Creativity level system (1-5)
- Responsive design
- Playful Geometric theme

---

## License

MIT License

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: This file (DOCS.md)

---

*Documentation generated for PromptGen v1.0.0*
