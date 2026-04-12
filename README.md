# EvalPrompts

AI-powered platform for evaluating and optimizing prompts for image generation.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)

## What is EvalPrompts?

EvalPrompts helps you create better prompts for AI image generators like Midjourney, Stable Diffusion, and Flux.

**Instead of guessing if your prompt is "good," you get:**
- Custom evaluation criteria generated from what you want
- Scores and feedback on every prompt
- Targeted improvements for weak areas
- Live image previews with Flux AI

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000, add your API keys, and start creating.

## How It Works

```
1. Describe what you want  →  " portraits with dramatic lighting"
2. Get evaluation criteria ←  AI generates what "good" means
3. Generate prompts         ←  Optimized for your criteria
4. Test with images        ←  Flux AI generates previews
5. Get scores + feedback  ←  GPT-4o-mini evaluates
6. Improve iteratively    ←  Fix weak areas, repeat
```

## Features

| Feature | What it does |
|---------|-------------|
| Custom Criteria | Describe your goal, get tailored evaluation rules |
| Prompt Generation | AI creates optimized prompts for your criteria |
| Live Preview | Generate real images with Flux AI |
| Scoring | Get detailed scores with improvement suggestions |
| Iterative Fix | Improve specific weak areas, not everything |
| Favorites | Save best results, spot patterns |

## API Keys

Get free keys at:
- **OpenAI** → https://platform.openai.com/api-keys
- **Fal AI** → https://fal.ai/

Keys stay in your browser. Nothing is stored server-side.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- OpenAI GPT-4o-mini
- Fal AI Flux

## Project Structure

```
evalprompts/
├── app/              # Pages and server actions
├── components/       # React components
│   └── ui/        # Base UI components
├── hooks/         # Custom React hooks
├── lib/           # Utilities
└── types/         # TypeScript types
```

## Contributing

1. Clone the repo
2. Run `npm install` and `npm run dev`
3. Make your changes
4. Test and submit a PR

## License

MIT