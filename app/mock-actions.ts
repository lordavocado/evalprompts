"use server"

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

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

// Mock image generation for demonstration
export async function generateImagesMock(prompts: string[]): Promise<string[]> {
  console.log("Using mock image generation...")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return prompts.map((prompt, index) => {
    // Generate different placeholder images based on prompt content
    const encodedPrompt = encodeURIComponent(prompt)
    return `/placeholder.svg?height=400&width=400&query=${encodedPrompt}`
  })
}

// Real Fal AI image generation with better error handling
export async function generateImages(prompts: string[]): Promise<string[]> {
  // Check if FAL_KEY is available
  if (!process.env.FAL_KEY) {
    console.log("FAL_KEY not found, using mock generation")
    return generateImagesMock(prompts)
  }

  const imageUrls: string[] = []

  // Dynamic import to handle potential module issues
  try {
    const fal = await import("@fal-ai/serverless-client")

    fal.config({
      credentials: process.env.FAL_KEY,
    })

    for (const prompt of prompts) {
      try {
        console.log(`Generating image for prompt: ${prompt}`)

        const result = (await fal.subscribe("fal-ai/flux-pro", {
          input: {
            prompt: prompt,
            image_size: "square",
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: 1,
            enable_safety_checker: true,
          },
          logs: true,
        })) as any

        if (result && result.images && result.images.length > 0) {
          imageUrls.push(result.images[0].url)
          console.log(`Successfully generated image`)
        } else {
          console.log("No images in result, using placeholder")
          imageUrls.push(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
        }
      } catch (error) {
        console.error("Error generating individual image:", error)
        imageUrls.push(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
      }
    }
  } catch (importError) {
    console.error("Error importing Fal AI module:", importError)
    console.log("Falling back to mock generation")
    return generateImagesMock(prompts)
  }

  return imageUrls
}

export async function evaluatePrompts(prompts: PromptData[]) {
  const model = createOpenAI()("gpt-5-mini" as any)

  // Evaluate each prompt individually
  const evaluatedPrompts = await Promise.all(
    prompts.map(async (prompt) => {
      const { text: evaluation } = await generateText({
        model,
        prompt: `You are an expert AI image generation prompt evaluator. Analyze this prompt and evaluate its potential effectiveness.

Prompt: "${prompt.text}"

Even if you cannot see the actual generated image, evaluate the prompt based on:
1. Image Quality Potential: How likely is this prompt to produce high-quality, clear, well-composed images?
2. Adherence Potential: How specific and clear is the prompt in describing what should be generated?
3. Aesthetic Appeal Potential: How likely is this prompt to produce visually appealing results?

Evaluate the prompt on these criteria (score 1-10):
1. Quality Potential: Technical clarity, composition guidance, detail level
2. Adherence Potential: Specificity, clarity, unambiguous description
3. Aesthetic Potential: Visual appeal guidance, artistic direction, style clarity

Provide your evaluation in this exact JSON format:
{
  "quality": [score],
  "adherence": [score], 
  "aesthetic": [score],
  "overall": [average of the three scores],
  "feedback": "[detailed feedback about the prompt's strengths and weaknesses]",
  "suggestions": ["[specific suggestion 1]", "[specific suggestion 2]", "[specific suggestion 3]"]
}

Focus on:
- Specific, actionable suggestions for improvement
- Clear identification of what works well and what could be better
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
  const model = createOpenAI()("gpt-5-mini" as any)

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
