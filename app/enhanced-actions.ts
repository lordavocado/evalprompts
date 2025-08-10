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

const PLACEHOLDER_MARKER = "placeholder.svg"

// Mock image generation for demonstration
export async function generateImagesMock(prompts: string[], model: FluxModel): Promise<string[]> {
  console.log(`Using mock image generation with ${model.name}...`)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return prompts.map((prompt) => {
    const encodedPrompt = encodeURIComponent(`${prompt} (${model.name})`)
    return `/placeholder.svg?height=400&width=400&query=${encodedPrompt}`
  })
}

export async function generateImages(
  prompts: string[],
  model: FluxModel,
  apiKeys: { openaiKey?: string; falKey?: string },
): Promise<string[]> {
  console.log("🎨 Starting image generation...")
  console.log("Model:", model.name)
  console.log("Prompts count:", prompts.length)
  console.log("Fal AI key provided:", !!apiKeys.falKey)
  
  if (!apiKeys.falKey) {
    console.log("❌ Fal AI key not provided, using mock generation")
    return generateImagesMock(prompts, model)
  }

  // Validate Fal AI key format
  if (apiKeys.falKey.length < 10 || !/^[!-~]+$/.test(apiKeys.falKey)) {
    console.error("❌ Invalid Fal AI key format")
    console.log("Falling back to mock generation")
    return generateImagesMock(prompts, model)
  }

  const imageUrls: string[] = []
  let successfulGenerations = 0

  try {
    console.log("🔧 Configuring Fal AI client...")
    
    // Dynamically import Fal to avoid build issues
    const fal = await import("@fal-ai/serverless-client")

    // Configure with user-provided key using modern approach
    fal.config({
      credentials: apiKeys.falKey,
    })
    
    console.log("✅ Fal AI client configured successfully")
    console.log("🔑 Using Fal API key:", apiKeys.falKey.substring(0, 8) + "...")

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      try {
        console.log(`🖼️ [${i + 1}/${prompts.length}] Generating image with ${model.name}`)
        console.log(`📝 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`)

        // Use model-specific parameters based on Fal.ai API spec
        const parameters = {
          prompt: prompt,
          aspect_ratio: "1:1", // default unless user adds aspect hints
          num_inference_steps: model.parameters?.num_inference_steps?.[1] || 28,
          guidance_scale: model.parameters?.guidance_scale?.[1] || 3.5,
          num_images: 1,
          enable_safety_checker: true,
          output_format: "jpeg", // Specify output format
          sync_mode: false, // Async by default for better performance
        }

        console.log("⚙️ Parameters:", JSON.stringify(parameters, null, 2))
        console.log(`🌐 Endpoint: ${model.endpoint}`)

        let result: any = null
        let usedEndpoint = model.endpoint

        try {
          // Try the primary endpoint first
          result = await fal.subscribe(model.endpoint, {
            input: parameters,
            logs: true,
            pollInterval: 1000,
            timeout: 60000, // 60 second timeout
          })
        } catch (endpointError: any) {
          console.warn(`⚠️ Primary endpoint ${model.endpoint} failed:`, endpointError.message)
          
          // Fallback to flux/dev if the current endpoint fails
          if (model.endpoint !== "fal-ai/flux/dev") {
            console.log("🔄 Falling back to fal-ai/flux/dev endpoint...")
            usedEndpoint = "fal-ai/flux/dev"
            result = await fal.subscribe("fal-ai/flux/dev", {
              input: parameters,
              logs: true,
              pollInterval: 1000,
              timeout: 60000,
            })
          } else {
            throw endpointError // Re-throw if even the fallback fails
          }
        }

        console.log(`📨 Fal AI Response from ${usedEndpoint}:`, JSON.stringify(result, null, 2))

        if (result && result.images && result.images.length > 0) {
          imageUrls.push(result.images[0].url)
          successfulGenerations++
          console.log(`✅ [${i + 1}/${prompts.length}] Successfully generated image`)
          console.log(`🔗 Image URL: ${result.images[0].url}`)
        } else {
          console.log(`❌ [${i + 1}/${prompts.length}] No images in result, using placeholder`)
          console.log("Full result:", result)
          imageUrls.push(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
        }
      } catch (error: any) {
        console.error(`❌ [${i + 1}/${prompts.length}] Error generating image:`)
        console.error("Error details:", error)
        console.error("Error message:", error?.message)
        console.error("Error status:", error?.status)
        console.error("Error response:", error?.response?.data)
        imageUrls.push(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
      }
    }

    // Note: Usage tracking is handled client-side to avoid server/client reference issues

    console.log(`🎯 Generation Summary: ${successfulGenerations}/${prompts.length} successful`)
    
    if (successfulGenerations === 0) {
      console.log("⚠️ All image generations failed - check Fal AI key and account status")
    }

    return imageUrls
  } catch (importError: any) {
    console.error("❌ Critical error with Fal AI service:")
    console.error("Import error:", importError)
    console.error("Error message:", importError?.message)
    console.error("Error stack:", importError?.stack)
    console.log("🔄 Falling back to mock generation")
    return generateImagesMock(prompts, model)
  }
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
            prompt: `You are an expert AI prompt engineer. Your task is to improve an image generation prompt by integrating specific user instructions while maintaining quality and coherence.

CURRENT PROMPT: "${prompt.text}"

USER'S CUSTOM INSTRUCTION: "${direction}"

EVALUATION FRAMEWORK:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `• ${criterion.name}: ${criterion.description} (Weight: ${Math.round(criterion.weight * 100)}%)`)
  .join("\n")}

${favoriteInsights ? `USER PREFERENCE INSIGHTS: ${favoriteInsights}` : ""}

OPTIMIZATION STRATEGY:
1. **Primary Focus**: The user instruction "${direction}" must be the central theme of your improvements
2. **Integration Method**: Don't just append the instruction - weave it naturally into the prompt structure
3. **Quality Maintenance**: Ensure the prompt remains coherent and technically optimized for AI image generation
4. **Criteria Alignment**: Balance the user instruction with the established evaluation criteria
5. **User Preferences**: Apply any relevant patterns from the user's favorite images

PROMPT ENGINEERING GUIDELINES:
- Use specific, descriptive language that AI models respond well to
- Maintain logical flow: subject → style/instruction → technical details → composition
- Include relevant keywords that enhance the user's intended direction
- Ensure the instruction is implemented through concrete, visual descriptions

Return ONLY the optimized prompt that seamlessly integrates the user instruction.`,
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

    // Generate comparative analysis and recommendations using a single call
    try {
      const { text: combinedAnalysis } = await generateText({
        model,
        prompt: `Using the following custom criteria and evaluation results, write a concise comparison (3-4 sentences) and then list 5 specific, actionable recommendations. Return ONLY valid JSON with the keys \"comparison\" (string) and \"recommendations\" (array of 5 strings). No markdown.\n\nCRITERIA DEFINITIONS:\n${Object.entries(criteria.criteria)
          .map(([key, criterion]) => `${criterion.name}: ${criterion.description} (${Math.round(criterion.weight * 100)}%)`)
          .join("\n")}\n\nCURRENT PERFORMANCE:\n${evaluatedPrompts
          .map((p, i) => `Prompt ${i + 1}: ${p.scores?.overall?.toFixed(1) || 0}/10 - ${p.feedback}`)
          .join("\n")}\n`,
      })

      // Track usage
      if (onTrackUsage) {
        onTrackUsage("gpt-4o-mini", 800)
      }

      const cleanCombined = combinedAnalysis.replace(/```json\s*|\s*```/g, "").trim()
      const parsedCombined = JSON.parse(cleanCombined)
      const comparison: string = parsedCombined.comparison || ""
      const recommendations: string[] = Array.isArray(parsedCombined.recommendations)
        ? parsedCombined.recommendations.slice(0, 5)
        : []

      // Identify best prompt
      const bestPrompt = evaluatedPrompts.reduce((best, current) =>
        (current.scores?.overall || 0) > (best.scores?.overall || 0) ? current : best,
      )

      return {
        prompts: evaluatedPrompts,
        comparison,
        bestPrompt: bestPrompt.text,
        recommendations,
        criteriaUsed: criteria,
      }
    } catch (comparisonError) {
      console.log("Error generating comparison+recommendations, using mock comparison")
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
            prompt: `You are an expert AI prompt engineer specializing in selective optimization. Your task is to enhance an image generation prompt by implementing specific improvements while maintaining its core identity.

CURRENT PROMPT: "${prompt.text}"
GENERATED IMAGE: ${prompt.imageUrl}

VISUAL ANALYSIS:
First, analyze the generated image carefully. Consider:
- How well does the image match the intended prompt?
- What visual elements are successful or missing?
- Are there composition, lighting, or quality issues?
- How does the visual result inform potential improvements?

EVALUATION FRAMEWORK:
${Object.entries(criteria.criteria)
  .map(([key, criterion]) => `• ${criterion.name}: ${criterion.description} (Weight: ${Math.round(criterion.weight * 100)}%, Current: ${prompt.scores?.[key] || 0}/10)`)
  .join("\n")}

Overall Performance: ${prompt.scores?.overall?.toFixed(1) || 0}/10

${
  selectedRecommendations.length > 0
    ? `TARGETED IMPROVEMENTS TO IMPLEMENT:
${selectedRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : ""
}

${favoriteInsights ? `USER PREFERENCE PATTERNS: ${favoriteInsights}` : ""}

OPTIMIZATION STRATEGY:
1. **Visual-Informed Enhancement**: Base improvements on both the text prompt and actual visual results
2. **Selective Enhancement**: Focus only on the selected improvement areas
3. **Score-Driven Approach**: Prioritize improvements for criteria with lower scores
4. **Image-Text Alignment**: Address gaps between prompt intent and visual outcome
5. **Quality Preservation**: Maintain what already works well in both prompt and image
6. **User Alignment**: Apply improvements in ways that align with user preferences

PROMPT ENGINEERING GUIDELINES:
- Analyze the visual result to identify specific areas for improvement
- Address gaps between the prompt's intent and the generated image
- Use concrete visual descriptions rather than abstract concepts
- Add specific technical terms that could improve image quality/composition
- Maintain proper prompt structure: subject → improvements → technical specs
- Ensure improvements enhance rather than replace the core concept
- Apply professional prompt engineering best practices informed by visual analysis

Return ONLY the optimized prompt that implements the selected improvements.`,
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
