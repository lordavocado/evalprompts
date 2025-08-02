"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as fal from "@fal-ai/serverless-client"

// Note: Fal AI configuration is now handled per-request with user-provided keys
// This prevents production conflicts with environment variables

interface PromptData {
  id: string
  text: string
  imageUrl?: string
  scores?: {
    quality: number
    adherence: number
    aesthetic: number
    overall: number
  }
  feedback?: string
  suggestions?: string[]
  iteration: number
}

// Note: This function is deprecated. Use generateImages from enhanced-actions.ts instead
// which properly handles user-provided API keys and avoids production conflicts
export async function generateImages(prompts: string[]): Promise<string[]> {
  console.warn("Deprecated: Use generateImages from enhanced-actions.ts instead")
  
  // Return placeholder images for all prompts
  return prompts.map((prompt) => 
    `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`
  )
}

export async function evaluatePrompts(prompts: PromptData[]) {
  const model = openai("gpt-4o")

  // Evaluate each prompt individually
  const evaluatedPrompts = await Promise.all(
    prompts.map(async (prompt) => {
      const { text: evaluation } = await generateText({
        model,
        prompt: `You are an expert AI image generation prompt evaluator. Analyze this prompt and its generated image.

Prompt: "${prompt.text}"
Image URL: ${prompt.imageUrl}

Evaluate the prompt on these criteria (score 1-10):
1. Image Quality: Technical quality, resolution, clarity, composition
2. Adherence to Prompt: How well the image matches the prompt description
3. Aesthetic Appeal: Visual appeal, artistic merit, color harmony, style

Provide your evaluation in this exact JSON format:
{
  "quality": [score],
  "adherence": [score], 
  "aesthetic": [score],
  "overall": [average of the three scores],
  "feedback": "[detailed feedback about strengths and weaknesses]",
  "suggestions": ["[specific suggestion 1]", "[specific suggestion 2]", "[specific suggestion 3]"]
}

Focus on:
- Specific, actionable suggestions for improvement
- Clear identification of what works well and what doesn't
- Prompt engineering best practices (specificity, clarity, descriptive language)
- Technical aspects that could enhance image generation`,
      })

      try {
        const parsed = JSON.parse(evaluation)
        return {
          ...prompt,
          scores: {
            quality: parsed.quality,
            adherence: parsed.adherence,
            aesthetic: parsed.aesthetic,
            overall: parsed.overall,
          },
          feedback: parsed.feedback,
          suggestions: parsed.suggestions,
        }
      } catch (error) {
        console.error("Error parsing evaluation:", error)
        return {
          ...prompt,
          scores: { quality: 5, adherence: 5, aesthetic: 5, overall: 5 },
          feedback: "Error evaluating prompt",
          suggestions: ["Try making the prompt more specific"],
        }
      }
    }),
  )

  // Generate comparative analysis
  const { text: comparison } = await generateText({
    model,
    prompt: `Compare these three AI image generation prompts and their evaluation results:

${evaluatedPrompts
  .map(
    (p, i) => `
Prompt ${i + 1}: "${p.text}"
Quality Score: ${p.scores?.quality}/10
Adherence Score: ${p.scores?.adherence}/10  
Aesthetic Score: ${p.scores?.aesthetic}/10
Overall Score: ${p.scores?.overall}/10
Feedback: ${p.feedback}
`,
  )
  .join("\n")}

Provide a comprehensive comparison highlighting:
1. Which prompt performed best overall and why
2. Specific strengths and weaknesses of each prompt
3. Key differences in performance across the evaluation criteria
4. Patterns or insights about what makes prompts more effective

Write in a clear, analytical style suitable for prompt optimization.`,
  })

  // Identify best prompt
  const bestPrompt = evaluatedPrompts.reduce((best, current) =>
    (current.scores?.overall || 0) > (best.scores?.overall || 0) ? current : best,
  )

  // Generate general recommendations
  const { text: recommendationsText } = await generateText({
    model,
    prompt: `Based on the evaluation of these AI image generation prompts, provide 5 general recommendations for improving prompt effectiveness:

${evaluatedPrompts
  .map(
    (p, i) => `
Prompt ${i + 1}: "${p.text}" (Score: ${p.scores?.overall}/10)
Issues: ${p.suggestions?.join(", ")}
`,
  )
  .join("\n")}

Focus on:
- Prompt engineering best practices
- Common patterns that lead to better results
- Specific techniques for improvement
- How to balance specificity with creativity

Provide actionable, specific recommendations.`,
  })

  const recommendations = recommendationsText
    .split("\n")
    .filter((line) => line.trim().length > 0 && (line.includes(".") || line.includes(":")))
    .slice(0, 5)

  return {
    prompts: evaluatedPrompts,
    comparison,
    bestPrompt: bestPrompt.text,
    recommendations,
  }
}

export async function refinePrompts(prompts: PromptData[]): Promise<PromptData[]> {
  const model = openai("gpt-4o")

  const refinedPrompts = await Promise.all(
    prompts.map(async (prompt) => {
      const { text: refinedPrompt } = await generateText({
        model,
        prompt: `You are an expert prompt engineer. Refine this AI image generation prompt based on the evaluation feedback.

Original Prompt: "${prompt.text}"
Current Scores:
- Quality: ${prompt.scores?.quality}/10
- Adherence: ${prompt.scores?.adherence}/10  
- Aesthetic: ${prompt.scores?.aesthetic}/10
- Overall: ${prompt.scores?.overall}/10

Feedback: ${prompt.feedback}
Suggestions: ${prompt.suggestions?.join(", ")}

Create an improved version of this prompt that addresses the identified weaknesses while maintaining the core concept. Apply these prompt engineering best practices:

1. **Specificity**: Add specific details about style, composition, lighting, colors
2. **Clarity**: Use clear, unambiguous language
3. **Technical terms**: Include relevant artistic and photographic terminology
4. **Structure**: Organize elements logically (subject, style, composition, lighting, etc.)
5. **Keywords**: Use effective keywords that AI models respond well to

Return ONLY the refined prompt text, nothing else.`,
      })

      return {
        ...prompt,
        text: refinedPrompt.trim(),
        imageUrl: undefined,
        scores: undefined,
        feedback: undefined,
        suggestions: undefined,
      }
    }),
  )

  return refinedPrompts
}
