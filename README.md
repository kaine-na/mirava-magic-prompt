# Mirava Magic Prompt

✨ **AI Prompt Generator** - Create optimized prompts for Midjourney, DALL-E, Stable Diffusion, and more.

## Features

- 🎨 **Image Prompts** - Generate prompts for various styles (Realistic, Anime, 3D, Painting, etc.)
- 🎬 **Video Prompts** - Create prompts for Cinematic, Animation, Documentary, and more
- 🔒 **Secure** - API keys encrypted with AES-256-GCM
- 🚫 **IP Safe** - 500+ blocked terms to avoid copyright issues
- 📜 **History** - Track and export your prompt history
- 🌐 **Multi-Provider** - OpenAI, Gemini, Groq, OpenRouter support

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Security

- All API keys are encrypted locally using AES-256-GCM
- No data is sent to any server except the AI providers you configure
- Content Security Policy (CSP) headers enabled
- XSS protection with comprehensive input sanitization

## License

MIT © Mirava
