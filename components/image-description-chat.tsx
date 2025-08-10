"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageCircle, Sparkles, Send, Copy, Shuffle, Zap } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface ImageDescriptionChatProps {
  onComplete: (description: string) => void
  apiKeys: { openaiKey?: string; falKey?: string }
  variationMode: "identical" | "variations" | "radical"
  onVariationModeChange: (mode: "identical" | "variations" | "radical") => void
}

export function ImageDescriptionChat({ onComplete, apiKeys, variationMode, onVariationModeChange }: ImageDescriptionChatProps) {
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) return

    setIsLoading(true)
    try {
      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onComplete(description.trim())
    } catch (error) {
      console.error("Error processing description:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const examplePrompts = [
    "A fantasy landscape with magical creatures",
    "Professional headshots for LinkedIn",
    "Product photography for e-commerce",
    "Abstract art for modern interior design",
    "Character designs for a video game",
    "Architectural visualization of a modern home",
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <MessageCircle className="w-6 h-6" />
            EvalPrompts - Describe Your Vision
          </CardTitle>
          <CardDescription>
            Tell EvalPrompts about the type of image you want to create, and our AI will design custom evaluation
            criteria and generate optimized prompts for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-mono-50 border-mono-200">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>EvalPrompts AI:</strong> Based on your description, our AI will create personalized evaluation
              criteria and generate 3 different optimized prompts tailored to your specific needs.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What type of image are you trying to create?</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your image concept in detail... For example: 'I want to create professional product photos for my handmade jewelry business. The images should showcase the intricate details and craftsmanship while maintaining a clean, elegant aesthetic suitable for online sales.'"
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-mono-600">
                Be as specific as possible - mention style, purpose, audience, mood, and any technical requirements
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-mono-800">Prompt generation mode</label>
              <ToggleGroup
                type="single"
                value={variationMode}
                onValueChange={(val) => {
                  if (val) onVariationModeChange(val as "identical" | "variations" | "radical")
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="identical" aria-label="Identical prompts" className="border border-mono-200 bg-white text-mono-700 data-[state=on]:bg-mono-900 data-[state=on]:text-white">
                  <Copy className="w-4 h-4" />
                  Same
                </ToggleGroupItem>
                <ToggleGroupItem value="variations" aria-label="Small variations" className="border border-mono-200 bg-white text-mono-700 data-[state=on]:bg-mono-900 data-[state=on]:text-white">
                  <Shuffle className="w-4 h-4" />
                  Small variations
                </ToggleGroupItem>
                <ToggleGroupItem value="radical" aria-label="Radical differences" className="border border-mono-200 bg-white text-mono-700 data-[state=on]:bg-mono-900 data-[state=on]:text-white">
                  <Zap className="w-4 h-4" />
                  Radical
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!description.trim() || isLoading}
              size="lg"
              className="w-full bg-mono-900 hover:bg-mono-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating your custom evaluation...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Custom Criteria & Prompts
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-mono-700">Need inspiration? Try these examples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto p-3 text-xs bg-white border-mono-200 hover:bg-mono-50"
                  onClick={() => setDescription(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
