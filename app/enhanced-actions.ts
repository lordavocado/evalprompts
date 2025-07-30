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
): Promise<string[]> {
  if (!apiKeys.falKey) {
    console.log("FAL_KEY not provided, using mock generation")
    return generateImagesMock(prompts, model)
  }

  const imageUrls: string[] = []

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
  } catch (importError) {
    console.error("Error importing Fal AI module:", importError)
    console.log("Falling back to mock generation")
    return generateImagesMock(prompts, model)
  }

  return imageUrls
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
      suggestions: [], // Removed generic suggestions
    }
  })

  const bestPrompt = evaluatedPrompts.reduce((best, current) =>
    (current.scores?.overall || 0) > (best.scores?.overall || 0) ? current : best,
  )

  const comparison = `Based on your custom ${criteria.name.toLowerCase()} evaluation criteria, the prompts show varying levels of effectiveness. ${bestPrompt.text.slice(0, 50)}... performed best with a score of ${bestPrompt.scores?.overall}/10.`

  const recommendations = [
    `Focus on ${Object.values(criteria.criteria)[0].name.toLowerCase()} as defined in your criteria`,
    `Enhance ${Object.values(criteria.criteria)[1].name.toLowerCase()} based on your success definition`,
    `Consider your favorite images' patterns when refining prompts`,
    `Balance all criteria according to your custom weightings`,
    `Iterate based on your specific evaluation framework`,
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

    // Analyze favorites for pattern recognition
    let favoriteAnalysis = ""
    if (favorites.length > 0) {
      const { text: analysis } = await generateText({
        model,
        prompt: `Analyze these favorite images to understand user preferences:

${favorites
  .map(
    (fav, i) => `
Favorite ${i + 1}:
Prompt: "${fav.prompt}"
Image URL: ${fav.imageUrl}
Score: ${fav.scores?.overall || "N/A"}/10
`,
  )
  .join("\n")}

Identify patterns in:
1. Visual style preferences
2. Subject matter preferences  
3. Composition preferences
4. Quality indicators the user values

Provide insights in 2-3 sentences that can guide future evaluations.`,
      })
      favoriteAnalysis = analysis
    }

    // Evaluate each prompt individually using GPT-4o-mini with custom criteria
    const evaluatedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        const criteriaDescriptions = Object.entries(criteria.criteria)
          .map(
            ([key, criterion]) =>
              `${key} (${Math.round(criterion.weight * 100)}% weight): ${criterion.name} - ${criterion.description}`,
          )
          .join("\n")

        try {
          const { text: evaluation } = await generateText({
            model,
            prompt: `You are an expert AI image evaluation specialist. Analyze this prompt and generated image using the user's CUSTOM evaluation criteria.

PROMPT TO EVALUATE: "${prompt.text}"
IMAGE URL: ${prompt.imageUrl}

CUSTOM EVALUATION CRITERIA:
${criteriaDescriptions}

${
  favoriteAnalysis
    ? `USER PREFERENCE INSIGHTS (from favorite images):
${favoriteAnalysis}

Consider these preferences when evaluating.`
    : ""
}

TASK: Provide detailed evaluation based ONLY on the custom criteria provided above. Each criterion has a specific definition and weight.

For IMAGE ANALYSIS (if available):
- Examine how well the image meets each custom criterion
- Reference specific visual elements that align with or miss the criteria definitions
- Consider the user's demonstrated preferences from favorites

For PROMPT ANALYSIS:
- Evaluate how well the prompt would generate images meeting each criterion
- Assess alignment with the custom success definitions provided

Provide evaluation in ONLY a valid JSON object (no markdown, no code blocks, no extra text):
{
  ${Object.keys(criteria.criteria)
    .map((name) => `"${name}": [score 1-10 based on the specific criterion definition]`)
    .join(",\n  ")},
  "overall": [weighted average using the specified weights],
  "feedback": "[detailed analysis referencing the specific custom criteria definitions and how the image/prompt performs against each one. Be specific about what you observe and how it relates to the user's success definitions.]"
}

Focus your analysis specifically on the custom criteria definitions provided. Do not use generic evaluation standards.`,
          })

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
            suggestions: [], // Removed generic suggestions
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
        prompt: `Compare these AI image generation prompts using the custom evaluation criteria:

CUSTOM CRITERIA:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name} (${Math.round(criterion.weight * 100)}%): ${criterion.description}`)
  .join("\n")}

EVALUATION RESULTS:
${evaluatedPrompts
  .map(
    (p, i) => `
PROMPT ${i + 1}: "${p.text}"
IMAGE: ${p.imageUrl}
SCORES:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `- ${criterion.name}: ${p.scores?.[key] || 0}/10`)
  .join("\n")}
Overall Score: ${p.scores?.overall?.toFixed(1) || 0}/10

FEEDBACK: ${p.feedback}
`,
  )
  .join("\n")}

${favoriteAnalysis ? `USER PREFERENCES (from favorites): ${favoriteAnalysis}` : ""}

Provide a comprehensive comparison specifically based on the custom criteria definitions. Analyze:

1. **Performance Ranking**: Which prompt performed best according to the custom criteria?
2. **Visual Analysis**: How do the generated images align with the specific success definitions?
3. **Criteria-Specific Insights**: Performance differences across the custom evaluation framework
4. **Pattern Recognition**: What patterns emerge relative to the user's defined success metrics?

Write a detailed analysis that references the specific custom criteria and their definitions.`,
      })

      // Identify best prompt
      const bestPrompt = evaluatedPrompts.reduce((best, current) =>
        (current.scores?.overall || 0) > (best.scores?.overall || 0) ? current : best,
      )

      // Generate actionable recommendations using GPT-4o-mini
      const { text: recommendationsText } = await generateText({
        model,
        prompt: `Based on the custom evaluation criteria and results, provide 5 specific recommendations for improving prompt effectiveness:

CUSTOM CRITERIA DEFINITIONS:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name} (${Math.round(criterion.weight * 100)}%): ${criterion.description}`)
  .join("\n")}

EVALUATION RESULTS:
${evaluatedPrompts
  .map(
    (p, i) => `
Prompt ${i + 1}: "${p.text}" (Score: ${p.scores?.overall?.toFixed(1) || 0}/10)
Image: ${p.imageUrl}
Performance: ${p.feedback}
`,
  )
  .join("\n")}

${favoriteAnalysis ? `USER PREFERENCES: ${favoriteAnalysis}` : ""}

Provide recommendations in this format:
1. [Specific recommendation targeting the custom criteria definitions]
2. [Specific recommendation targeting the custom criteria definitions]
3. [Specific recommendation targeting the custom criteria definitions]
4. [Specific recommendation targeting the custom criteria definitions]
5. [Specific recommendation targeting the custom criteria definitions]

Each recommendation should:
- Be specific to the custom criteria definitions provided
- Address observed gaps in meeting the success definitions
- Consider the user's demonstrated preferences from favorites
- Be actionable and concrete
- Reference the specific criterion weights and definitions`,
      })

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
      prompt: `Analyze these favorite images to identify patterns in user preferences:

${favorites
  .map(
    (fav, i) => `
Favorite ${i + 1}:
Prompt: "${fav.prompt}"
Image URL: ${fav.imageUrl}
Overall Score: ${fav.scores?.overall || "N/A"}/10
Timestamp: ${new Date(fav.timestamp).toLocaleDateString()}
${fav.notes ? `Notes: ${fav.notes}` : ""}
`,
  )
  .join("\n")}

Provide analysis in ONLY a valid JSON object (no markdown, no code blocks, no extra text):
{
  "analysis": "Comprehensive analysis covering visual style patterns, subject matter preferences, composition preferences, quality indicators, and prompt engineering insights",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2", 
    "Specific actionable recommendation 3",
    "Specific actionable recommendation 4",
    "Specific actionable recommendation 5"
  ],
  "styleInsights": [
    "Key visual style insight 1",
    "Key visual style insight 2",
    "Key visual style insight 3"
  ]
}

Focus on actionable insights that can improve future prompt generation and evaluation.`,
    })

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

// Apply AI recommendations to improve prompts
export async function applyRecommendations(
  prompts: PromptData[],
  recommendations: string[],
  criteria: EvaluationCriteria,
  favorites: FavoriteImage[],
  apiKeys: { openaiKey?: string; falKey?: string },
): Promise<PromptData[]> {
  if (!apiKeys.openaiKey) {
    console.log("OpenAI API key not provided, using mock application")
    return prompts.map((prompt) => ({
      ...prompt,
      text: prompt.text + ", enhanced with AI recommendations",
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
      const patterns = await analyzeFavoritePatterns(favorites, apiKeys)
      favoriteInsights = patterns.analysis
    }

    const improvedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        try {
          const { text: improvedPrompt } = await generateText({
            model,
            prompt: `You are an expert prompt engineer. Improve this AI image generation prompt based on custom evaluation criteria and user preferences.

ORIGINAL PROMPT: "${prompt.text}"

CUSTOM EVALUATION CRITERIA:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name} (${Math.round(criterion.weight * 100)}%): ${criterion.description}`)
  .join("\n")}

CURRENT PERFORMANCE:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `- ${criterion.name}: ${prompt.scores?.[key] || 0}/10`)
  .join("\n")}
Overall: ${prompt.scores?.overall?.toFixed(1) || 0}/10

FEEDBACK: ${prompt.feedback}

GENERAL RECOMMENDATIONS TO APPLY:
${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

${
  favoriteInsights
    ? `USER PREFERENCE PATTERNS (from favorites):
${favoriteInsights}`
    : ""
}

TASK: Create an improved version that:
1. Addresses the specific custom criteria definitions
2. Incorporates the general recommendations
3. Maintains the core creative intent
4. Aligns with user preferences from favorite images
5. Optimizes for the weighted success metrics

IMPORTANT: Focus specifically on the custom criteria definitions provided, not generic quality metrics.

Return ONLY the improved prompt text, nothing else.`,
          })

          return {
            ...prompt,
            text: improvedPrompt.trim(),
            imageUrl: undefined,
            scores: undefined,
            feedback: undefined,
            suggestions: undefined,
          }
        } catch (error: any) {
          console.error("Error applying recommendations to prompt:", error?.message || error)
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
    console.error("Error applying recommendations:", error?.message || error)
    return prompts.map((prompt) => ({
      ...prompt,
      text: prompt.text + ", enhanced with AI recommendations",
      imageUrl: undefined,
      scores: undefined,
      feedback: undefined,
      suggestions: undefined,
    }))
  }
}

// Mock refinement function
async function mockRefinePrompts(prompts: PromptData[], criteria: EvaluationCriteria): Promise<PromptData[]> {
  console.log("Using mock prompt refinement")
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return prompts.map((prompt) => {
    const refinedText = prompt.text + ", enhanced based on custom criteria"
    return {
      ...prompt,
      text: refinedText,
      imageUrl: undefined,
      scores: undefined,
      feedback: undefined,
      suggestions: undefined,
    }
  })
}

export async function refinePromptsWithCriteria(
  prompts: PromptData[],
  criteria: EvaluationCriteria,
  favorites: FavoriteImage[],
  apiKeys: { openaiKey?: string; falKey?: string },
): Promise<PromptData[]> {
  if (!apiKeys.openaiKey) {
    console.log("OpenAI API key not provided, using mock refinement")
    return mockRefinePrompts(prompts, criteria)
  }

  try {
    const model = openai("gpt-4o-mini", {
      apiKey: apiKeys.openaiKey,
    })

    // Get favorite patterns if available
    let favoriteInsights = ""
    if (favorites.length > 0) {
      const patterns = await analyzeFavoritePatterns(favorites, apiKeys)
      favoriteInsights = patterns.analysis
    }

    const refinedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        try {
          const { text: refinedPrompt } = await generateText({
            model,
            prompt: `You are an expert prompt engineer. Refine this AI image generation prompt based on custom evaluation criteria and user feedback.

Original Prompt: "${prompt.text}"

CUSTOM EVALUATION CRITERIA:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `${criterion.name} (${Math.round(criterion.weight * 100)}%): ${criterion.description}`)
  .join("\n")}

Current Performance:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `- ${criterion.name}: ${prompt.scores?.[key] || 0}/10`)
  .join("\n")}
Overall Score: ${prompt.scores?.overall?.toFixed(1) || 0}/10

Feedback: ${prompt.feedback}

${
  favoriteInsights
    ? `USER PREFERENCE PATTERNS:
${favoriteInsights}`
    : ""
}

Create an improved version that addresses the custom criteria definitions while maintaining the core concept. Focus specifically on:

${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `- Improving ${criterion.name}: ${criterion.description}`)
  .join("\n")}

Consider the user's demonstrated preferences from their favorite images when refining.

Return ONLY the refined prompt text, nothing else. Make it specifically optimized for the custom success definitions provided.`,
          })

          return {
            ...prompt,
            text: refinedPrompt.trim(),
            imageUrl: undefined,
            scores: undefined,
            feedback: undefined,
            suggestions: undefined,
          }
        } catch (error: any) {
          console.error("Error refining individual prompt:", error?.message || error)
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

    return refinedPrompts
  } catch (error: any) {
    console.error("Error with OpenAI refinement:", error?.message || error)
    return mockRefinePrompts(prompts, criteria)
  }
}
