"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"
import type { FluxModel } from "@/types/flux-models"

interface PromptData {
  id: string
  text: string
  imageUrl?: string
  scores?: Record<string, number> & { overall: number }
  feedback?: string
  suggestions?: string[]
  iteration: number
  isFavorite?: boolean
}

interface FavoriteImage {
  id: string
  imageUrl: string
  prompt: string
  scores?: Record<string, number> & { overall: number }
  timestamp: number
  notes?: string
}

// Mock image generation for demonstration
export async function generateImagesMock(prompts: string[], model: FluxModel): Promise<string[]> {
  console.log(`Using mock image generation with ${model.name}...`)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return prompts.map((prompt, index) => {
    const encodedPrompt = encodeURIComponent(`${prompt} (${model.name})`)
    return `/placeholder.svg?height=400&width=400&query=${encodedPrompt}`
  })
}

export async function generateImages(
  prompts: string[],
  model: FluxModel,
  apiKeys: { openaiKey?: string; falKey?: string },
  onTrackUsage?: (modelId: string, imageCount: number) => void,
): Promise<string[]> {
  if (!apiKeys.falKey) {
    console.log("FAL_KEY not provided, using mock generation")
    return generateImagesMock(prompts, model)
  }

  const imageUrls: string[] = []
  let successfulGenerations = 0

  try {
    const fal = await import("@fal-ai/serverless-client")

    fal.config({
      credentials: apiKeys.falKey,
    })

    for (const prompt of prompts) {
      try {
        console.log(`Generating image with ${model.name} for prompt: ${prompt}`)

        // Use model-specific parameters
        const parameters = {
          prompt: prompt,
          image_size: "square",
          num_inference_steps: model.parameters?.num_inference_steps?.[1] || 28,
          guidance_scale: model.parameters?.guidance_scale?.[1] || 3.5,
          num_images: 1,
          enable_safety_checker: true,
        }

        const result = (await fal.subscribe(model.endpoint, {
          input: parameters,
          logs: true,
        })) as any

        if (result && result.images && result.images.length > 0) {
          imageUrls.push(result.images[0].url)
          successfulGenerations++
          console.log(`Successfully generated image with ${model.name}`)
        } else {
          console.log("No images in result, using placeholder")
          imageUrls.push(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
        }
      } catch (error) {
        console.error("Error generating individual image:", error)
        imageUrls.push(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
      }
    }

    // Track successful generations
    if (onTrackUsage && successfulGenerations > 0) {
      onTrackUsage(model.endpoint, successfulGenerations)
    }
  } catch (importError) {
    console.error("Error importing Fal AI module:", importError)
    console.log("Falling back to mock generation")
    return generateImagesMock(prompts, model)
  }

  return imageUrls
}

// Apply custom direction to improve prompts
export async function applyCustomDirection(
  prompts: PromptData[],
  direction: string,
  criteria: EvaluationCriteria,
  favorites: FavoriteImage[],
  apiKeys: { openaiKey?: string; falKey?: string },
  onTrackUsage?: (model: string, estimatedTokens: number) => void,
): Promise<PromptData[]> {
  if (!apiKeys.openaiKey) {
    console.log("OpenAI API key not provided, using mock improvement")
    return prompts.map((prompt) => ({
      ...prompt,
      text: `${prompt.text}, ${direction}`,
      imageUrl: undefined,
      scores: undefined,
      feedback: undefined,
      suggestions: undefined,
    }))
  }

  try {
    const model = openai("gpt-4o-mini", {
      apiKey: apiKeys.openaiKey,
    })

    // Get favorite patterns if available
    let favoriteInsights = ""
    if (favorites.length > 0) {
      const patterns = await analyzeFavoritePatterns(favorites, apiKeys, onTrackUsage)
      favoriteInsights = patterns.analysis
    }

    const improvedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        try {
          const { text: improvedPrompt } = await generateText({
            model,
            prompt: `Improve this AI image prompt based on the user's specific direction:

ORIGINAL PROMPT: "${prompt.text}"

USER DIRECTION: "${direction}"

EVALUATION CRITERIA:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name}: ${criterion.description}`)
  .join("\n")}

${favoriteInsights ? `USER PREFERENCES: ${favoriteInsights}` : ""}

Create an improved version that:
1. Incorporates the user's specific direction as the primary focus
2. Maintains the core creative concept
3. Aligns with the evaluation criteria definitions
4. Considers user preferences from favorite images

IMPORTANT: The user direction "${direction}" should be the main focus of the improvements.

Return ONLY the improved prompt text, nothing else.`,
          })

          // Track usage for improvement
          if (onTrackUsage) {
            onTrackUsage("gpt-4o-mini", 400)
          }

          return {
            ...prompt,
            text: improvedPrompt.trim(),
            imageUrl: undefined,
            scores: undefined,
            feedback: undefined,
            suggestions: undefined,
          }
        } catch (error: any) {
          console.error("Error improving prompt:", error?.message || error)
          return {
            ...prompt,
            text: `${prompt.text}, ${direction}`,
            imageUrl: undefined,
            scores: undefined,
            feedback: undefined,
            suggestions: undefined,
          }
        }
      }),
    )

    return improvedPrompts
  } catch (error: any) {
    console.error("Error applying custom direction:", error?.message || error)
    return prompts.map((prompt) => ({
      ...prompt,
      text: `${prompt.text}, ${direction}`,
      imageUrl: undefined,
      scores: undefined,
      feedback: undefined,
      suggestions: undefined,
    }))
  }
}

// Mock evaluation function for when OpenAI API is not available
async function mockEvaluatePrompts(prompts: PromptData[], criteria: EvaluationCriteria, favorites: FavoriteImage[]) {
  console.log("Using mock evaluation")
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const evaluatedPrompts = prompts.map((prompt) => {
    const baseScore = Math.min(Math.max(prompt.text.length / 20, 3), 8)
    const variation = Math.random() * 2 - 1

    const mockScores: Record<string, number> & { overall: number } = { overall: 0 }
    let totalWeightedScore = 0

    Object.entries(criteria.criteria).forEach(([key, criterion]) => {
      const score = Math.min(Math.max(baseScore + variation + Math.random() * 2 - 1, 1), 10)
      mockScores[key] = Math.round(score * 10) / 10
      totalWeightedScore += score * criterion.weight
    })

    mockScores.overall = Math.round(totalWeightedScore * 10) / 10

    const mockFeedback = `This prompt shows ${mockScores.overall >= 7 ? "strong" : mockScores.overall >= 5 ? "moderate" : "limited"} potential for ${criteria.name.toLowerCase()}. ${
      mockScores.overall >= 7
        ? "The prompt demonstrates good alignment with your custom criteria."
        : "Consider refining based on your specific success criteria."
    }`

    return {
      ...prompt,
      scores: mockScores,
      feedback: mockFeedback,
      suggestions: [],
    }
  })

  const bestPrompt = evaluatedPrompts.reduce((best, current) =>
    (current.scores?.overall || 0) > (best.scores?.overall || 0) ? current : best,
  )

  const comparison = `Based on your ${criteria.name.toLowerCase()} criteria, Prompt ${bestPrompt.id} performed best with ${bestPrompt.scores?.overall}/10. The prompts show varying effectiveness across your custom evaluation framework.`

  const recommendations = [
    `Enhance ${Object.values(criteria.criteria)[0].name.toLowerCase()} by adding more specific details`,
    `Improve ${Object.values(criteria.criteria)[1].name.toLowerCase()} based on your success definition`,
    `Consider patterns from your favorite images when refining prompts`,
    `Balance all criteria according to your custom weightings`,
    `Add technical specifications that align with your evaluation framework`,
  ]

  return {
    prompts: evaluatedPrompts,
    comparison,
    bestPrompt: bestPrompt.text,
    recommendations,
    criteriaUsed: criteria,
  }
}

export async function evaluatePromptsWithCriteria(
  prompts: PromptData[],
  criteria: EvaluationCriteria,
  favorites: FavoriteImage[],
  apiKeys: { openaiKey?: string; falKey?: string },
  onTrackUsage?: (model: string, estimatedTokens: number) => void,
) {
  if (!apiKeys.openaiKey) {
    console.log("OpenAI API key not provided, using mock evaluation")
    return mockEvaluatePrompts(prompts, criteria, favorites)
  }

  try {
    // Use GPT-4o-mini for image analysis and evaluation
    const model = openai("gpt-4o-mini", {
      apiKey: apiKeys.openaiKey,
    })

    // Test API availability
    try {
      await generateText({
        model,
        prompt: "Test",
        maxTokens: 1,
      })
    } catch (testError: any) {
      console.log("OpenAI API test failed:", testError?.message || testError)
      return mockEvaluatePrompts(prompts, criteria, favorites)
    }

    // Track usage for test call
    if (onTrackUsage) {
      onTrackUsage("gpt-4o-mini", 10)
    }

    // Analyze favorites for pattern recognition
    let favoriteAnalysis = ""
    if (favorites.length > 0) {
      const { text: analysis } = await generateText({
        model,
        prompt: `Analyze these favorite images briefly to understand user preferences:

${favorites
  .map(
    (fav, i) => `
Favorite ${i + 1}: "${fav.prompt}" (Score: ${fav.scores?.overall || "N/A"}/10)
`,
  )
  .join("\n")}

Provide 2-3 sentences about visual patterns and preferences.`,
      })
      favoriteAnalysis = analysis

      // Track usage for favorites analysis
      if (onTrackUsage) {
        onTrackUsage("gpt-4o-mini", 300)
      }
    }

    // Evaluate each prompt individually using GPT-4o-mini with custom criteria
    const evaluatedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        const criteriaDescriptions = Object.entries(criteria.criteria)
          .map(
            ([key, criterion]) =>
              `${key}: ${criterion.name} (${Math.round(criterion.weight * 100)}% weight) - ${criterion.description}`,
          )
          .join("\n")

        try {
          const { text: evaluation } = await generateText({
            model,
            prompt: `Evaluate this AI image prompt and generated image using these SPECIFIC custom criteria:

PROMPT: "${prompt.text}"
IMAGE: ${prompt.imageUrl}

CUSTOM CRITERIA:
${criteriaDescriptions}

${favoriteAnalysis ? `USER PREFERENCES: ${favoriteAnalysis}` : ""}

Score each criterion 1-10 based on the EXACT definitions provided above. Focus on how well the image/prompt meets each specific success definition.

Respond with ONLY valid JSON (no markdown):
{
  ${Object.keys(criteria.criteria)
    .map((name) => `"${name}": [score 1-10]`)
    .join(",\n  ")},
  "overall": [weighted average],
  "feedback": "[2-3 sentences explaining the scores based on the specific criteria definitions]"
}`,
          })

          // Track usage for individual evaluation
          if (onTrackUsage) {
            onTrackUsage("gpt-4o-mini", 800)
          }

          // Clean the response to remove any markdown formatting
          const cleanEvaluation = evaluation.replace(/```json\s*|\s*```/g, "").trim()
          const parsed = JSON.parse(cleanEvaluation)

          let weightedScore = 0
          for (const [key, criterion] of Object.entries(criteria.criteria)) {
            if (parsed[key]) {
              weightedScore += parsed[key] * criterion.weight
            }
          }

          const scores: Record<string, number> & { overall: number } = {
            ...parsed,
            overall: Math.round(weightedScore * 10) / 10,
          }

          return {
            ...prompt,
            scores,
            feedback: parsed.feedback,
            suggestions: [],
          }
        } catch (error: any) {
          console.error("Error evaluating individual prompt:", error?.message || error)

          const defaultScores: Record<string, number> & { overall: number } = { overall: 5 }
          for (const key of Object.keys(criteria.criteria)) {
            defaultScores[key] = 5
          }

          return {
            ...prompt,
            scores: defaultScores,
            feedback: "Error evaluating prompt - using default scores",
            suggestions: [],
          }
        }
      }),
    )

    // Generate comparative analysis using GPT-4o-mini
    try {
      const { text: comparison } = await generateText({
        model,
        prompt: `Compare these prompts using the custom criteria. Keep it concise (3-4 sentences):

CRITERIA: ${Object.entries(criteria.criteria)
          .map(([key, criterion]) => `${criterion.name} (${Math.round(criterion.weight * 100)}%)`)
          .join(", ")}

RESULTS:
${evaluatedPrompts.map((p, i) => `Prompt ${i + 1}: ${p.scores?.overall?.toFixed(1) || 0}/10`).join(", ")}

Which performed best and why? Focus on the custom criteria performance.`,
      })

      // Track usage for comparison
      if (onTrackUsage) {
        onTrackUsage("gpt-4o-mini", 400)
      }

      // Identify best prompt
      const bestPrompt = evaluatedPrompts.reduce((best, current) =>
        (current.scores?.overall || 0) > (best.scores?.overall || 0) ? current : best,
      )

      // Generate actionable recommendations using GPT-4o-mini
      const { text: recommendationsText } = await generateText({
        model,
        prompt: `Based on the evaluation results, provide 5 specific, actionable recommendations to improve the prompts:

CRITERIA DEFINITIONS:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name}: ${criterion.description}`)
  .join("\n")}

CURRENT PERFORMANCE:
${evaluatedPrompts
  .map((p, i) => `Prompt ${i + 1}: ${p.scores?.overall?.toFixed(1) || 0}/10 - ${p.feedback}`)
  .join("\n")}

Provide 5 recommendations in this format:
1. [Specific actionable improvement]
2. [Specific actionable improvement]
3. [Specific actionable improvement]
4. [Specific actionable improvement]
5. [Specific actionable improvement]

Each should be concrete and directly address the custom criteria definitions.`,
      })

      // Track usage for recommendations
      if (onTrackUsage) {
        onTrackUsage("gpt-4o-mini", 600)
      }

      const recommendations = recommendationsText
        .split("\n")
        .filter((line) => line.trim().match(/^\d+\./))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .slice(0, 5)

      return {
        prompts: evaluatedPrompts,
        comparison,
        bestPrompt: bestPrompt.text,
        recommendations,
        criteriaUsed: criteria,
      }
    } catch (comparisonError) {
      console.log("Error generating comparison, using mock comparison")
      return mockEvaluatePrompts(prompts, criteria, favorites)
    }
  } catch (error: any) {
    console.error("Error with OpenAI evaluation:", error?.message || error)
    return mockEvaluatePrompts(prompts, criteria, favorites)
  }
}

// Analyze favorite images for pattern recognition
export async function analyzeFavoritePatterns(
  favorites: FavoriteImage[],
  apiKeys: { openaiKey?: string; falKey?: string },
  onTrackUsage?: (model: string, estimatedTokens: number) => void,
): Promise<{
  analysis: string
  recommendations: string[]
  styleInsights: string[]
}> {
  if (!apiKeys.openaiKey || favorites.length < 2) {
    return {
      analysis: "Need at least 2 favorite images and OpenAI API key to analyze patterns.",
      recommendations: [],
      styleInsights: [],
    }
  }

  try {
    const model = openai("gpt-4o-mini", {
      apiKey: apiKeys.openaiKey,
    })

    const { text: analysisText } = await generateText({
      model,
      prompt: `Analyze these favorite images to identify patterns:

${favorites
  .map((fav, i) => `Favorite ${i + 1}: "${fav.prompt}" (Score: ${fav.scores?.overall || "N/A"}/10)`)
  .join("\n")}

Respond with ONLY valid JSON (no markdown):
{
  "analysis": "Brief analysis of visual patterns and preferences (2-3 sentences)",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2", 
    "Specific recommendation 3",
    "Specific recommendation 4",
    "Specific recommendation 5"
  ],
  "styleInsights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ]
}`,
    })

    // Track usage for analysis
    if (onTrackUsage) {
      onTrackUsage("gpt-4o-mini", 600)
    }

    // Clean the response to remove any markdown formatting
    const cleanAnalysisText = analysisText.replace(/```json\s*|\s*```/g, "").trim()
    const parsed = JSON.parse(cleanAnalysisText)

    return {
      analysis: parsed.analysis || "Analysis completed successfully.",
      recommendations: parsed.recommendations || [],
      styleInsights: parsed.styleInsights || [],
    }
  } catch (error: any) {
    console.error("Error analyzing favorite patterns:", error?.message || error)
    return {
      analysis: "Error analyzing favorite patterns. Please try again.",
      recommendations: [],
      styleInsights: [],
    }
  }
}

// Apply selective improvements with user feedback
export async function improvePromptsSelectively(
  prompts: PromptData[],
  selectedRecommendations: string[],
  criteria: EvaluationCriteria,
  favorites: FavoriteImage[],
  apiKeys: { openaiKey?: string; falKey?: string },
  onTrackUsage?: (model: string, estimatedTokens: number) => void,
): Promise<PromptData[]> {
  if (!apiKeys.openaiKey) {
    console.log("OpenAI API key not provided, using mock improvement")
    return prompts.map((prompt) => ({
      ...prompt,
      text: prompt.text + ", enhanced with selected improvements",
      imageUrl: undefined,
      scores: undefined,
      feedback: undefined,
      suggestions: undefined,
    }))
  }

  try {
    const model = openai("gpt-4o-mini", {
      apiKey: apiKeys.openaiKey,
    })

    // Get favorite patterns if available
    let favoriteInsights = ""
    if (favorites.length > 0) {
      const patterns = await analyzeFavoritePatterns(favorites, apiKeys, onTrackUsage)
      favoriteInsights = patterns.analysis
    }

    const improvedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        try {
          const { text: improvedPrompt } = await generateText({
            model,
            prompt: `Improve this AI image prompt based on the specific evaluation criteria and selected improvements:

ORIGINAL PROMPT: "${prompt.text}"

EVALUATION CRITERIA:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name}: ${criterion.description}`)
  .join("\n")}

CURRENT SCORES:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name}: ${prompt.scores?.[key] || 0}/10`)
  .join("\n")}
Overall: ${prompt.scores?.overall?.toFixed(1) || 0}/10

${
  selectedRecommendations.length > 0
    ? `SELECTED IMPROVEMENTS TO APPLY:
${selectedRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : ""
}

${favoriteInsights ? `USER PREFERENCES: ${favoriteInsights}` : ""}

Create an improved version that:
1. Addresses the selected improvement areas specifically
2. Maintains the core creative concept
3. Aligns with the evaluation criteria definitions
4. Considers user preferences from favorite images

Return ONLY the improved prompt text, nothing else.`,
          })

          // Track usage for improvement
          if (onTrackUsage) {
            onTrackUsage("gpt-4o-mini", 600)
          }

          return {
            ...prompt,
            text: improvedPrompt.trim(),
            imageUrl: undefined,
            scores: undefined,
            feedback: undefined,
            suggestions: undefined,
          }
        } catch (error: any) {
          console.error("Error improving prompt:", error?.message || error)
          return {
            ...prompt,
            imageUrl: undefined,
            scores: undefined,
            feedback: undefined,
            suggestions: undefined,
          }
        }
      }),
    )

    return improvedPrompts
  } catch (error: any) {
    console.error("Error improving prompts:", error?.message || error)
    return prompts.map((prompt) => ({
      ...prompt,
      text: prompt.text + ", enhanced with selected improvements",
      imageUrl: undefined,
      scores: undefined,
      feedback: undefined,
      suggestions: undefined,
    }))
  }
}

// Legacy functions for backward compatibility
export const improvePrompts = improvePromptsSelectively
export const applyRecommendations = improvePromptsSelectively
export const refinePromptsWithCriteria = improvePromptsSelectively
