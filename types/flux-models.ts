export interface FluxModel {
  id: string
  name: string
  description: string
  category: "realistic" | "artistic" | "general" | "specialized"
  strengths: string[]
  bestFor: string[]
  endpoint: string
  parameters?: {
    guidance_scale?: [number, number]
    num_inference_steps?: [number, number]
    aspect_ratios?: string[]
  }
}

export const FLUX_MODELS: FluxModel[] = [
  {
    id: "flux-dev",
    name: "Flux Dev",
    description: "High-quality model with good balance of speed and quality (Recommended)",
    category: "general",
    strengths: ["High quality", "Good speed", "Versatile", "Commercial use"],
    bestFor: ["Most use cases", "Professional work", "High-quality outputs"],
    endpoint: "fal-ai/flux/dev",
    parameters: {
      guidance_scale: [1, 10],
      num_inference_steps: [20, 40],
      aspect_ratios: ["square", "portrait", "landscape"],
    },
  },
  {
    id: "flux-schnell",
    name: "Flux Schnell",
    description: "Ultra-fast model for quick iterations (1-4 steps)",
    category: "general",
    strengths: ["Very fast", "Low cost", "Sub-second results"],
    bestFor: ["Quick tests", "Concept exploration", "Rapid prototyping"],
    endpoint: "fal-ai/flux/schnell",
    parameters: {
      guidance_scale: [1, 8],
      num_inference_steps: [1, 4],
      aspect_ratios: ["square", "portrait", "landscape"],
    },
  },
  {
    id: "flux-general",
    name: "Flux General",
    description: "Versatile endpoint with LoRA and ControlNet support",
    category: "general",
    strengths: ["LoRA support", "ControlNet", "IP-Adapter", "Extensible"],
    bestFor: ["Advanced features", "Custom styles", "Fine-tuned models"],
    endpoint: "fal-ai/flux-general",
    parameters: {
      guidance_scale: [1, 10],
      num_inference_steps: [20, 40],
      aspect_ratios: ["square", "portrait", "landscape"],
    },
  },
]

export function getModelRecommendations(description: string, criteria: any): FluxModel[] {
  const lowerDesc = description.toLowerCase()
  const recommendations: FluxModel[] = []

  // Analyze description for model recommendations
  if (lowerDesc.includes("realistic") || lowerDesc.includes("photo") || lowerDesc.includes("portrait")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-dev")!)
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-general")!)
  }

  if (lowerDesc.includes("anime") || lowerDesc.includes("manga") || lowerDesc.includes("character")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-general")!)
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-dev")!)
  }

  if (lowerDesc.includes("fast") || lowerDesc.includes("quick") || lowerDesc.includes("test")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-schnell")!)
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-dev")!)
  }

  if (lowerDesc.includes("professional") || lowerDesc.includes("commercial") || lowerDesc.includes("high quality")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-dev")!)
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-general")!)
  }

  if (lowerDesc.includes("custom") || lowerDesc.includes("style") || lowerDesc.includes("lora")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-general")!)
  }

  // Default recommendations if none match
  if (recommendations.length === 0) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-dev")!)
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-schnell")!)
  }

  return [...new Set(recommendations)] // Remove duplicates
}
