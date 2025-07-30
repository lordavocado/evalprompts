"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"

interface GeneratedContent {
  criteria: EvaluationCriteria
  prompts: string[]
}

// Mock function for when OpenAI is not available
async function mockGenerateContent(description: string): Promise<GeneratedContent> {
  console.log("Using mock content generation")
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

  // Generate mock prompts based on description
  const basePrompts = [
    `${description}, highly detailed, professional quality`,
    `${description}, artistic style, enhanced composition, vibrant colors`,
    `${description}, cinematic lighting, 8K resolution, masterpiece quality`,
  ]

  return {
    criteria: mockCriteria,
    prompts: basePrompts,
  }
}

export async function generateCustomContent(
  description: string,
  apiKeys: { openaiKey?: string; falKey?: string },
): Promise<GeneratedContent> {
  // Check if OpenAI API key is available
  if (!apiKeys.openaiKey) {
    console.log("OpenAI API key not provided, using mock generation")
    return mockGenerateContent(description)
  }

  try {
    const model = openai("gpt-4o", {
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
      return mockGenerateContent(description)
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

    // Generate 3 optimized Flux prompts
    const { text: promptsText } = await generateText({
      model,
      prompt: `Based on this image creation request: "${description}"

Generate 3 different, highly optimized prompts for Flux AI image generation. Each prompt should:
1. Be specifically tailored to the described use case
2. Include relevant technical details (lighting, composition, style)
3. Use effective keywords that work well with AI image generation
4. Be distinct from each other while serving the same goal
5. Be optimized for the best possible results

Respond with ONLY a valid JSON array of exactly 3 strings (no markdown, no code blocks, no extra text):
["prompt1", "prompt2", "prompt3"]

Make each prompt detailed and specific, incorporating best practices for AI image generation.`,
    })

    try {
      // Clean the responses to remove any markdown formatting
      const cleanCriteriaText = criteriaText.replace(/```json\s*|\s*```/g, "").trim()
      const cleanPromptsText = promptsText.replace(/```json\s*|\s*```/g, "").trim()

      const parsedCriteria = JSON.parse(cleanCriteriaText)
      const parsedPrompts = JSON.parse(cleanPromptsText)

      // Validate and create criteria object
      const criteria: EvaluationCriteria = {
        id: `custom_${Date.now()}`,
        name: parsedCriteria.name,
        description: parsedCriteria.description,
        icon: parsedCriteria.icon,
        criteria: parsedCriteria.criteria,
        evaluationPrompt: `Evaluate this prompt based on custom criteria for: ${description}`,
        suggestionFocus: parsedCriteria.suggestionFocus,
      }

      return {
        criteria,
        prompts: Array.isArray(parsedPrompts) ? parsedPrompts : [description],
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return mockGenerateContent(description)
    }
  } catch (error: any) {
    console.error("Error generating custom content:", error?.message || error)
    return mockGenerateContent(description)
  }
}
