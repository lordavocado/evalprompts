# AGENTS.md

Instructions for AI agents working on EvalPrompts.

## Project

EvalPrompts - AI-powered platform for evaluating and optimizing prompts for image generation.

## Tech Stack

- Next.js 15 (AppRouter)
- React 19
- TypeScript
- Tailwind CSS
- OpenAI GPT-4o-mini
- Fal AI Flux

## Commands

```bash
npm install     # Install dependencies
npm run dev    # Start dev server
npm run build  # Production build
```

## Important Rules

1. **No breaking changes** - Don't remove or rename exported functions
2. **TypeScript strict** - All new code must pass type checking
3. **Test locally** - Run `npm run build` before submitting changes
4. **Use existing patterns** - Follow the code style already in the repo

## Modifying Components

- UI components: `components/ui/` (Radix-based)
- Feature components: `components/` root level
- Hooks: `hooks/` directory

## Server Actions

AI logic lives in `app/actions.ts`. When modifying:
- Keep functions type-safe with Zod schemas
- Handle errors gracefully with user-friendly messages
- Add proper loading states for UI

## Adding Features

1. Create feature branch
2. Make changes
3. Test with `npm run build`
4. Commit and describe what changed

## Code Review Tips

- Check for TypeScript errors first
- Verify all imports resolve
- Ensure error handling is present
- Don't expose API keys or secrets

## Common Tasks

| Task | Where |
|------|-------|
| Add UI component | `components/` |
| Add hook | `hooks/` |
| Modify AI logic | `app/actions.ts` |
| Add type | `types/` |
| Add styling | `tailwind.config.ts` |

## Getting Help

- Next.js docs: https://nextjs.org/docs
- React docs: https://react.dev
- Tailwind: https://tailwindcss.com/docs