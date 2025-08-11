"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"

interface GeneratedContent {
  criteria: EvaluationCriteria
  prompts: string[]
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

export async function generateCustomContent(
  description: string,
  apiKeys: { openaiKey?: string; falKey?: string },
  mode: VariationMode = "variations",
): Promise<GeneratedContent> {
  // Require OpenAI API key
  if (!apiKeys.openaiKey) {
    throw new Error("OpenAI API key is required to generate criteria and prompts.")
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
      throw new Error(`OpenAI API test failed: ${testError?.message || String(testError)}`)
    }

    // Generate criteria AND prompts in a single response
    let promptGenerationInstruction = ""

    if (mode === "identical") {
      promptGenerationInstruction = `Generate 1 highly optimized prompt for Flux AI image generation, then return it 3 times in the array. The prompt should be specifically tailored to: "${description}"`
    } else if (mode === "radical") {
      promptGenerationInstruction = `Generate 3 completely different and radical approaches to: "${description}". Each prompt should take a fundamentally different creative direction - for example: one photorealistic, one artistic/stylized, one minimalist/abstract. Make them as diverse as possible while still serving the core concept.`
    } else {
      // variations mode (default)
      promptGenerationInstruction = `Generate 3 different, optimized prompts for Flux AI image generation based on: "${description}". Each prompt should be similar but with small variations in style, composition, or technical details.`
    }

    const { text: combinedText } = await generateText({
      model,
      prompt: `Based on this image creation request: "${description}"\n\nReturn a SINGLE JSON object with BOTH custom evaluation criteria and 3 prompts. No markdown, no extra text. Use this exact schema:\n{\n  "criteria": {\n    "name": "string",
    "description": "string",
    "icon": "emoji",
    "criteria": {"criterion1": {"name": "string", "description": "string", "weight": 0.25}, "criterion2": {"name": "string", "description": "string", "weight": 0.25}, "criterion3": {"name": "string", "description": "string", "weight": 0.25}, "criterion4": {"name": "string", "description": "string", "weight": 0.25}},
    "suggestionFocus": ["string", "string", "string", "string", "string"]
  },
  "prompts": ["prompt1", "prompt2", "prompt3"]
}\n\n${promptGenerationInstruction}\n\nEach prompt should:\n1. Include relevant technical details (lighting, composition, style, camera)\n2. Include aspect ratio hints when appropriate\n3. Use effective keywords for AI image generation\n4. Include optional negative prompt hints where helpful\n5. Avoid copyrighted character names unless user-provided`,
    })

    try {
      const parsed = extractJson<any>(combinedText)
      const parsedCriteria = parsed.criteria
      const parsedPrompts = parsed.prompts

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
      }
    } catch (parseError) {
      throw new Error(`Error parsing combined AI response: ${String(parseError)}`)
    }
  } catch (error: any) {
    throw new Error(error?.message || String(error))
  }
}
