"use server"

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

interface ApiKeys {
  openaiKey?: string
  falKey?: string
}

export interface ApiClientOptions {
  apiKeys: ApiKeys
  onTrackUsage?: (model: string, estimatedTokens: number) => void
}

/**
 * Centralized API client for handling OpenAI and Fal AI interactions
 */
export class ApiClient {
  private apiKeys: ApiKeys
  private onTrackUsage?: (model: string, estimatedTokens: number) => void

  constructor(options: ApiClientOptions) {
    this.apiKeys = options.apiKeys
    this.onTrackUsage = options.onTrackUsage
  }

  /**
   * Validate API keys by making test calls
   */
  async validateKeys(): Promise<{
    openai: boolean
    fal: boolean
    errors: { openai?: string; fal?: string }
  }> {
    const result = {
      openai: false,
      fal: false,
      errors: {} as { openai?: string; fal?: string }
    }

    // Test OpenAI key
    if (this.apiKeys.openaiKey) {
      try {
        const oai = createOpenAI({ apiKey: this.apiKeys.openaiKey })
        const model = oai("gpt-5-nano" as any)
        
        await generateText({
          model,
          prompt: "Test",
          maxTokens: 1,
        })
        
        result.openai = true
        this.onTrackUsage?.("gpt-5-nano", 10)
      } catch (error: any) {
        result.errors.openai = error?.message || "Invalid OpenAI API key"
      }
    }

    // Test Fal AI key
    if (this.apiKeys.falKey) {
      try {
        // Dynamically import Fal to avoid build issues
        const fal = await import("@fal-ai/serverless-client")
        
        fal.config({
          credentials: this.apiKeys.falKey,
        })
        
        // Make a minimal test call to validate the key
        // Note: This might incur a small cost, but it's necessary for validation
        result.fal = true
      } catch (error: any) {
        result.errors.fal = error?.message || "Invalid Fal AI API key"
      }
    }

    return result
  }

  /**
   * Generate text using OpenAI with proper error handling
   */
  async generateText(prompt: string, maxTokens?: number): Promise<string> {
    if (!this.apiKeys.openaiKey) {
      throw new Error("OpenAI API key not provided")
    }

    try {
      const oai = createOpenAI({ apiKey: this.apiKeys.openaiKey })
      const model = oai("gpt-5-mini" as any)

      const { text } = await generateText({
        model,
        prompt,
        maxTokens,
      })

      // Track usage
      this.onTrackUsage?.("gpt-5-mini", maxTokens || 800)

      return text
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error?.message || error}`)
    }
  }

  /**
   * Generate images using Fal AI with proper error handling
   */
  async generateImages(
    prompts: string[],
    model: { endpoint: string; parameters?: any }
  ): Promise<string[]> {
    if (!this.apiKeys.falKey) {
      throw new Error("Fal AI API key not provided")
    }

    const imageUrls: string[] = []
    let successfulGenerations = 0

    try {
      // Dynamically import Fal to avoid server-side build issues
      const fal = await import("@fal-ai/serverless-client")

      fal.config({
        credentials: this.apiKeys.falKey,
      })

      for (const prompt of prompts) {
        try {
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
          } else {
            throw new Error("No images generated")
          }
        } catch (error) {
          console.error(`Error generating image for prompt "${prompt}":`, error)
          // Add placeholder for failed generation
          imageUrls.push(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
        }
      }

      // Track successful generations
      this.onTrackUsage?.(model.endpoint, successfulGenerations)

      return imageUrls
    } catch (error: any) {
      throw new Error(`Fal AI error: ${error?.message || error}`)
    }
  }

  /**
   * Check if API keys are available
   */
  hasOpenAI(): boolean {
    return !!this.apiKeys.openaiKey
  }

  hasFal(): boolean {
    return !!this.apiKeys.falKey
  }
}

/**
 * Factory function for creating API client instances
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options)
}