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

// Heuristic prompt rewriter removed to enforce API-key-only behavior

const PLACEHOLDER_MARKER = "placeholder.svg"

export async function generateImages(
  prompts: string[],
  model: FluxModel,
  apiKeys: { openaiKey?: string; falKey?: string },
): Promise<string[]> {
  if (!apiKeys.falKey) {
    throw new Error("Fal AI API key is required to generate images.")
  }

  // Validate Fal AI key format
  if (apiKeys.falKey.length < 10 || !/^[!-~]+$/.test(apiKeys.falKey)) {
    throw new Error("Invalid Fal AI key format.")
  }

  const imageUrls: string[] = []

  try {
    // Dynamically import Fal to avoid build issues
    const fal = await import("@fal-ai/serverless-client")

    // Configure with user-provided key using modern approach
    fal.config({
      credentials: apiKeys.falKey,
    })

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      try {
        const parameters = {
          prompt: prompt,
          aspect_ratio: "1:1",
          num_inference_steps: model.parameters?.num_inference_steps?.[1] || 28,
          guidance_scale: model.parameters?.guidance_scale?.[1] || 3.5,
          num_images: 1,
          enable_safety_checker: true,
          output_format: "jpeg",
          sync_mode: false,
        }

        let result: any = null
        let usedEndpoint = model.endpoint

        try {
          // Try the primary endpoint first
          result = await fal.subscribe(model.endpoint, {
            input: parameters,
            logs: true,
            pollInterval: 1000,
            timeout: 60000,
          })
        } catch (endpointError: any) {
          // Fallback to flux/dev if the current endpoint fails
          if (model.endpoint !== "fal-ai/flux/dev") {
            usedEndpoint = "fal-ai/flux/dev"
            result = await fal.subscribe("fal-ai/flux/dev", {
              input: parameters,
              logs: true,
              pollInterval: 1000,
              timeout: 60000,
            })
          } else {
            throw endpointError
          }
        }

        if (result && result.images && result.images.length > 0) {
          imageUrls.push(result.images[0].url)
        } else {
          throw new Error("Fal AI returned no images for a prompt.")
        }
      } catch (error: any) {
        throw new Error(error?.message || String(error))
      }
    }

    return imageUrls
  } catch (importError: any) {
    throw new Error(importError?.message || String(importError))
  }
}

export async function applyCustomDirection(
  prompts: PromptData[],
  direction: string,
  criteria: EvaluationCriteria,
  favorites: FavoriteImage[],
  apiKeys: { openaiKey?: string; falKey?: string },
  onTrackUsage?: (model: string, estimatedTokens: number) => void,
): Promise<PromptData[]> {
  if (!apiKeys.openaiKey) {
    throw new Error("OpenAI API key is required to apply custom direction.")
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
      }),
    )

    return improvedPrompts
  } catch (error: any) {
    throw new Error(error?.message || String(error))
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
    throw new Error("OpenAI API key is required to evaluate prompts.")
  }

  try {
    // Use gpt-4o-mini for image analysis and evaluation
    const miniModel = openai("gpt-4o-mini", {
      apiKey: apiKeys.openaiKey,
    })
    const nanoModel = openai("gpt-4o-mini", {
      apiKey: apiKeys.openaiKey,
    })

    // Test API availability
    try {
      await generateText({
        model: nanoModel,
        prompt: "Test",
        maxTokens: 1,
      })
    } catch (testError: any) {
      throw new Error(`OpenAI API test failed: ${testError?.message || String(testError)}`)
    }

    // Track usage for test call
    if (onTrackUsage) {
      onTrackUsage("gpt-4o-mini", 10)
    }

    // Analyze favorites for pattern recognition
    let favoriteAnalysis = ""
    if (favorites.length > 0) {
      const { text: analysis } = await generateText({
        model: miniModel,
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

    // Evaluate each prompt individually using gpt-4o-mini with custom criteria
    const evaluatedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        const criteriaDescriptions = Object.entries(criteria.criteria)
          .map(
            ([key, criterion]) =>
              `${key}: ${criterion.name} (${Math.round(criterion.weight * 100)}% weight) - ${criterion.description}`,
          )
          .join("\n")

        const { text: evaluation } = await generateText({
          model: miniModel,
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
      }),
    )

    // Generate comparative analysis and recommendations using a single call
    const { text: combinedAnalysis } = await generateText({
      model: miniModel,
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
  } catch (error: any) {
    throw new Error(error?.message || String(error))
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
  if (!apiKeys.openaiKey) {
    throw new Error("OpenAI API key is required to analyze favorite patterns.")
  }
  if (favorites.length < 2) {
    throw new Error("Need at least 2 favorite images to analyze patterns.")
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
    throw new Error(error?.message || String(error))
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
    throw new Error("OpenAI API key is required to improve prompts.")
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
            onTrackUsage("gpt-4o-mini", 800)
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
          throw new Error(error?.message || String(error))
        }
      }),
    )

    return improvedPrompts
  } catch (error: any) {
    throw new Error(error?.message || String(error))
  }
}

// Legacy functions for backward compatibility
export const improvePrompts = evaluatePromptsWithCriteria
export const applyRecommendations = evaluatePromptsWithCriteria
export const refinePromptsWithCriteria = evaluatePromptsWithCriteria
