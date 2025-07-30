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
    id: "flux-pro",
    name: "Flux Pro",
    description: "Premium model with highest quality and detail",
    category: "general",
    strengths: ["High detail", "Professional quality", "Versatile"],
    bestFor: ["Professional work", "High-quality outputs", "Commercial use"],
    endpoint: "fal-ai/flux-pro",
    parameters: {
      guidance_scale: [1, 10],
      num_inference_steps: [20, 50],
      aspect_ratios: ["square", "portrait", "landscape"],
    },
  },
  {
    id: "flux-dev",
    name: "Flux Dev",
    description: "Development model with good balance of speed and quality",
    category: "general",
    strengths: ["Fast generation", "Good quality", "Cost effective"],
    bestFor: ["Development", "Testing", "Rapid prototyping"],
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
    description: "Ultra-fast model for quick iterations",
    category: "general",
    strengths: ["Very fast", "Low cost", "Good for iterations"],
    bestFor: ["Quick tests", "Concept exploration", "Budget projects"],
    endpoint: "fal-ai/flux/schnell",
    parameters: {
      guidance_scale: [1, 8],
      num_inference_steps: [4, 20],
      aspect_ratios: ["square", "portrait", "landscape"],
    },
  },
  {
    id: "flux-realism",
    name: "Flux Realism",
    description: "Specialized for photorealistic images",
    category: "realistic",
    strengths: ["Photorealism", "Human faces", "Natural lighting"],
    bestFor: ["Portrait photography", "Product shots", "Realistic scenes"],
    endpoint: "fal-ai/flux-realism",
    parameters: {
      guidance_scale: [2, 8],
      num_inference_steps: [25, 50],
      aspect_ratios: ["square", "portrait", "landscape"],
    },
  },
  {
    id: "flux-anime",
    name: "Flux Anime",
    description: "Optimized for anime and manga style artwork",
    category: "artistic",
    strengths: ["Anime style", "Character design", "Vibrant colors"],
    bestFor: ["Anime art", "Character illustrations", "Manga style"],
    endpoint: "fal-ai/flux-anime",
    parameters: {
      guidance_scale: [3, 12],
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
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-realism")!)
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-pro")!)
  }

  if (lowerDesc.includes("anime") || lowerDesc.includes("manga") || lowerDesc.includes("character")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-anime")!)
  }

  if (lowerDesc.includes("fast") || lowerDesc.includes("quick") || lowerDesc.includes("test")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-schnell")!)
  }

  if (lowerDesc.includes("professional") || lowerDesc.includes("commercial") || lowerDesc.includes("high quality")) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-pro")!)
  }

  // Default recommendations if none match
  if (recommendations.length === 0) {
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-pro")!)
    recommendations.push(FLUX_MODELS.find((m) => m.id === "flux-dev")!)
  }

  return [...new Set(recommendations)] // Remove duplicates
}
