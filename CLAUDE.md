# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is EvalPrompts, an AI-powered prompt evaluation and optimization platform for image generation. The application helps users:
- Generate customized evaluation criteria based on user descriptions
- Create optimized prompts for AI image generation  
- Evaluate prompts using GPT-5-mini analysis
- Iteratively improve prompts through selective enhancements
- Track favorites and analyze patterns for better results

## Architecture

**Framework**: Next.js 15 with React 19, TypeScript, and Tailwind CSS

**Key Dependencies**:
- `@ai-sdk/openai` + `ai` - OpenAI integration for prompt generation and evaluation
- `@fal-ai/serverless-client` - Fal AI integration for image generation
- `@radix-ui/*` - UI component primitives
- `zod` - Schema validation

**Directory Structure**:
- `app/` - Next.js app router pages and server actions
- `components/` - React components (UI primitives in `ui/` subdirectory)
- `hooks/` - Custom React hooks for state management
- `types/` - TypeScript type definitions
- `lib/` - Utility functions

**Key Architecture Patterns**:
- Server Actions for AI API calls (`app/actions.ts`, `app/enhanced-actions.ts`)
- Custom hooks for client-side state (`use-secure-storage.ts`, `use-usage-tracking.ts`)
- Type-safe evaluation criteria system (`types/evaluation-criteria.ts`)
- Component composition with Radix UI primitives

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server  
npm start

# Linting
npm run lint
```

## Key Components

**Main Application Flow** (`app/page.tsx`):
1. API key setup (OpenAI + Fal AI)
2. User description input with chat interface
3. AI-generated custom criteria and prompts
4. Image generation using selected Flux models
5. AI evaluation with scoring and feedback
6. Selective improvements and iterations

**Server Actions**:
- `generateCustomContent()` - Creates evaluation criteria and prompts from user description
- `generateImages()` - Flux AI image generation 
- `evaluatePromptsWithCriteria()` - GPT-5-mini prompt evaluation
- `improvePromptsSelectively()` - Targeted prompt improvements

**State Management**:
- `useSecureStorage()` - Client-side API key storage
- `useUsageTracking()` - Request tracking and usage statistics

## API Integration

**OpenAI**: Uses GPT-5-mini for content generation, prompt evaluation, and improvements. All calls tracked for usage monitoring.

**Fal AI**: Image generation with multiple Flux model options. Model recommendations based on user description and criteria.

**API Keys**: Stored securely in browser localStorage with the `useSecureStorage` hook. Keys are passed to server actions for API calls.

## Development Notes

- TypeScript strict mode enabled with ES6 target
- Build errors and ESLint ignored during builds (configured in `next.config.mjs`)
- Uses absolute imports with `@/*` path mapping
- Responsive design with Tailwind CSS and custom component system
- Usage tracking for API calls with detailed statistics

## Recent Enhancements

**Phase 1 - Critical Fixes:**
- **Enhanced AI Prompt Engineering**: Custom instructions now properly integrated into AI improvement prompts with structured optimization strategies
- **Consolidated Fal API Configuration**: Removed conflicting server-side configurations, all API calls now use user-provided keys consistently
- **API Key Validation**: Added real-time validation with visual feedback for OpenAI and Fal AI keys

**Phase 2 - UX Improvements:**
- **Progress Indicators**: Enhanced loading overlays with step-by-step progress for content generation, image generation, and evaluation
- **Undo/Redo System**: Complete prompt history management with `usePromptHistory` hook and UI controls
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

**New Components:**
- `ProgressIndicator` - Configurable progress tracking with smooth animations
- `EnhancedLoadingOverlay` - Step-based loading screens with cancellation support
- `PromptHistoryPanel` - Full history management with timeline navigation
- `usePromptHistory` - Hook for managing prompt iterations with undo/redo functionality

**API Integration Improvements:**
- Centralized API client in `lib/api-client.ts` (foundation for future enhancements)
- Better error handling with graceful fallbacks to mock data
- Improved timeout handling and retry mechanisms for Fal AI calls