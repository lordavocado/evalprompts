# CLAUDE.md

Developer documentation for EvalPrompts.

## Project

AI-powered platform for evaluating and optimizing prompts for image generation.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Radix UI
- **AI**: OpenAI GPT-4o-mini, Fal AI Flux
- **Language**: TypeScript

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Linting
```

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main application |
| `app/actions.ts` | Server actions for AI calls |
| `components/` | React components |
| `hooks/` | Custom hooks |

## Architecture

- Server Actions handle AI API calls
- Client-side hooks manage state (`useSecureStorage`, `useUsageTracking`)
- Type-safe evaluation criteria in `types/evaluation-criteria.ts`
- Radix UI primitives in `components/ui/`

## Adding Features

1. UI components go in `components/`
2. Custom hooks go in `hooks/`
3. Server actions go in `app/actions.ts`
4. Types go in `types/`

## Style Guide

- Use existing component patterns
- Follow Tailwind CSS from `tailwind.config.ts`
- TypeScript strict mode enabled

## API Keys

- Stored in browser localStorage via `useSecureStorage` hook
- Passed to server actions for API calls
- Never stored server-side

## Key Hooks

- `useSecureStorage()` - API key storage
- `useUsageTracking()` - Request tracking
- `usePromptHistory()` - Undo/redo for prompts

## Build Notes

- ESLint errors ignored in production (Next.js config)
- Absolute imports: `@/*` maps to root