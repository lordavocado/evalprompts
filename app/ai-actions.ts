"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"

interface GeneratedContent {
  criteria: EvaluationCriteria
  prompts: string[]
  isMock: boolean
}

// Helper to safely extract and parse JSON from LLM output
function extractJson<T = unknown>(raw: string): T {
  const cleaned = raw.replace(/```json\s*|```/g, "").trim()
  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")
  const firstBracket = cleaned.indexOf("[")
  const lastBracket = cleaned.lastIndexOf("]")

  let candidate = cleaned
  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    candidate = cleaned.slice(firstBrace, lastBrace + 1)
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    candidate = cleaned.slice(firstBracket, lastBracket + 1)
  }

  return JSON.parse(candidate)
}

function normalizeCriteriaWeights(criteria: EvaluationCriteria["criteria"]): EvaluationCriteria["criteria"] {
  const weights = Object.values(criteria).map((c) => c.weight || 0)
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum <= 0) return criteria
  const normalized: EvaluationCriteria["criteria"] = {}
  for (const [key, crit] of Object.entries(criteria)) {
    normalized[key] = { ...(crit as any), weight: Number(((crit as any).weight || 0) / sum) }
  }
  return normalized
}

type VariationMode = "identical" | "variations" | "radical"

// Mock function for when OpenAI is not available
async function mockGenerateContent(description: string, mode: VariationMode): Promise<GeneratedContent> {
  console.log(`Using mock content generation with ${mode} mode`)
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Analyze description to determine type
  const lowerDesc = description.toLowerCase()
  const criteriaType = "custom"
  let icon = "⚡"
  let name = "Custom Evaluation"
  let criteriaDescription = "Tailored evaluation for your specific use case"

  if (lowerDesc.includes("product") || lowerDesc.includes("commercial") || lowerDesc.includes("business")) {
    icon = "💼"
    name = "Product & Commercial"
    criteriaDescription = "Optimized for product photography and commercial use"
  } else if (lowerDesc.includes("art") || lowerDesc.includes("creative") || lowerDesc.includes("artistic")) {
    icon = "🎨"
    name = "Artistic & Creative"
    criteriaDescription = "Focus on creativity and artistic expression"
  } else if (lowerDesc.includes("portrait") || lowerDesc.includes("character") || lowerDesc.includes("person")) {
    icon = "👤"
    name = "Portrait & Character"
    criteriaDescription = "Specialized for portraits and character design"
  } else if (lowerDesc.includes("landscape") || lowerDesc.includes("environment") || lowerDesc.includes("scene")) {
    icon = "🏞️"
    name = "Environmental & Scenic"
    criteriaDescription = "Focus on landscapes and environmental scenes"
  }

  const mockCriteria: EvaluationCriteria = {
    id: `custom_${Date.now()}`,
    name,
    description: criteriaDescription,
    icon,
    criteria: {
      relevance: {
        name: "Relevance",
        description: "How well the image matches your described vision",
        weight: 0.3,
      },
      quality: {
        name: "Technical Quality",
        description: "Overall technical execution and visual quality",
        weight: 0.25,
      },
      appeal: {
        name: "Visual Appeal",
        description: "Aesthetic attractiveness and visual impact",
        weight: 0.25,
      },
      uniqueness: {
        name: "Uniqueness",
        description: "Originality and distinctive characteristics",
        weight: 0.2,
      },
    },
    evaluationPrompt: `Evaluate this prompt based on custom criteria for: ${description}`,
    suggestionFocus: [
      "Add more specific details about the subject",
      "Include style and mood descriptors",
      "Specify technical requirements",
      "Enhance composition guidance",
      "Add lighting and atmosphere details",
    ],
  }

  // Generate mock prompts based on mode
  let basePrompts: string[]

  if (mode === "identical") {
    const singlePrompt = `${description}, highly detailed, professional quality`
    basePrompts = [singlePrompt, singlePrompt, singlePrompt]
  } else if (mode === "radical") {
    basePrompts = [
      `${description}, photorealistic style, studio lighting, commercial photography`,
      `${description}, artistic illustration, vibrant colors, creative composition`,
      `${description}, minimalist design, clean lines, modern aesthetic`,
    ]
  } else {
    // variations mode (default)
    basePrompts = [
      `${description}, highly detailed, professional quality`,
      `${description}, artistic style, enhanced composition, vibrant colors`,
      `${description}, cinematic lighting, 8K resolution, masterpiece quality`,
    ]
  }

  return {
    criteria: mockCriteria,
    prompts: basePrompts,
    isMock: true,
  }
}

export async function generateCustomContent(
  description: string,
  apiKeys: { openaiKey?: string; falKey?: string },
  mode: VariationMode = "variations",
): Promise<GeneratedContent> {
  // Check if OpenAI API key is available
  if (!apiKeys.openaiKey) {
    console.log("OpenAI API key not provided, using mock generation")
    return mockGenerateContent(description, mode)
  }

  try {
    const model = openai("gpt-5-mini", {
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
      return mockGenerateContent(description, mode)
    }

    // Generate custom evaluation criteria
    const { text: criteriaText } = await generateText({
      model,
      prompt: `Based on this image creation request: "${description}"

Create custom evaluation criteria that would be most relevant for assessing the quality and effectiveness of images for this specific use case.

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text):
{
  "name": "Descriptive name for this criteria set",
  "description": "Brief description of what this criteria focuses on",
  "icon": "Single emoji that represents this use case",
  "criteria": {
    "criterion1": {
      "name": "Criterion name",
      "description": "What this criterion evaluates",
      "weight": 0.25
    },
    "criterion2": {
      "name": "Criterion name",
      "description": "What this criterion evaluates",
      "weight": 0.25
    },
    "criterion3": {
      "name": "Criterion name",
      "description": "What this criterion evaluates",
      "weight": 0.25
    },
    "criterion4": {
      "name": "Criterion name",
      "description": "What this criterion evaluates",
      "weight": 0.25
    }
  },
  "suggestionFocus": [
    "Specific suggestion type 1",
    "Specific suggestion type 2",
    "Specific suggestion type 3",
    "Specific suggestion type 4",
    "Specific suggestion type 5"
  ]
}

Make sure the criteria are highly specific to the described use case and the weights sum to exactly 1.0.`,
    })

    // Generate prompts based on mode
    let promptGenerationInstruction = ""

    if (mode === "identical") {
      promptGenerationInstruction = `Generate 1 highly optimized prompt for Flux AI image generation, then return it 3 times in the array. The prompt should be specifically tailored to: "${description}"`
    } else if (mode === "radical") {
      promptGenerationInstruction = `Generate 3 completely different and radical approaches to: "${description}". Each prompt should take a fundamentally different creative direction - for example: one photorealistic, one artistic/stylized, one minimalist/abstract. Make them as diverse as possible while still serving the core concept.`
    } else {
      // variations mode (default)
      promptGenerationInstruction = `Generate 3 different, optimized prompts for Flux AI image generation based on: "${description}". Each prompt should be similar but with small variations in style, composition, or technical details.`
    }

    const { text: promptsText } = await generateText({
      model,
      prompt: `${promptGenerationInstruction}

Each prompt should:
1. Include relevant technical details (lighting, composition, style, camera)
2. Include explicit aspect ratio hints (e.g., 1:1, 3:4, 16:9) when appropriate
3. Use effective keywords that work well with AI image generation
4. Include optional negative prompt hints (e.g., "no text, no watermark, no blurry") where helpful
5. Avoid copyrighted character names or protected IP unless user-provided

Respond with ONLY a valid JSON array of exactly 3 strings (no markdown, no code blocks, no extra text):
["prompt1", "prompt2", "prompt3"]

Make each prompt detailed and specific, incorporating best practices for AI image generation, optimized for Flux via Fal.ai.`,
    })

    try {
      // Clean the responses to remove any markdown formatting and robustly parse JSON
      const parsedCriteria = extractJson<any>(criteriaText)
      const parsedPrompts = extractJson<any>(promptsText)

      // Validate and create criteria object
      const criteria: EvaluationCriteria = {
        id: `custom_${Date.now()}`,
        name: parsedCriteria.name,
        description: parsedCriteria.description,
        icon: parsedCriteria.icon,
        criteria: normalizeCriteriaWeights(parsedCriteria.criteria),
        evaluationPrompt: `Evaluate this prompt based on custom criteria for: ${description}`,
        suggestionFocus: parsedCriteria.suggestionFocus,
      }

      return {
        criteria,
        prompts: Array.isArray(parsedPrompts) ? parsedPrompts : [description],
        isMock: false,
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return mockGenerateContent(description, mode)
    }
  } catch (error: any) {
    console.error("Error generating custom content:", error?.message || error)
    return mockGenerateContent(description, mode)
  }
}
