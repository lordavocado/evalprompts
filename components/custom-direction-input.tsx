"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send, Loader2 } from "lucide-react"

interface CustomDirectionInputProps {
  onApplyDirection: (direction: string) => void
  isApplying: boolean
}

export function CustomDirectionInput({ onApplyDirection, isApplying }: CustomDirectionInputProps) {
  const [direction, setDirection] = useState("")

  const handleApply = () => {
    if (direction.trim()) {
      onApplyDirection(direction.trim())
      setDirection("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleApply()
    }
  }

  const exampleDirections = [
    "Make the style more minimalist and clean",
    "Add more dramatic lighting and shadows",
    "Focus on warmer, more inviting colors",
    "Make it more suitable for professional use",
    "Add more artistic flair and creativity",
    "Make it more vibrant and colorful",
  ]

  return (
    <Card className="mb-8 border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <MessageCircle className="w-5 h-5" />
          Custom Direction
        </CardTitle>
        <CardDescription className="text-gray-600">
          Tell the AI how you'd like to modify or improve your prompts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="direction" className="text-sm font-medium text-gray-700">
            What would you like to change or optimize?
          </Label>
          <Textarea
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., 'Make the images more vibrant and colorful', 'Focus more on realistic lighting', 'Add more artistic flair', 'Make it more suitable for social media', etc."
            rows={3}
            className="resize-none border-gray-300 focus:border-gray-500 focus:ring-gray-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {direction.trim() ? `${direction.length} characters` : "Enter your custom direction"}
          </div>
          <Button
            onClick={handleApply}
            disabled={!direction.trim() || isApplying}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Apply Direction
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Quick Examples:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleDirections.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-3 text-xs border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-transparent"
                onClick={() => setDirection(example)}
                disabled={isApplying}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>💡 How it works:</strong> The AI will rewrite your prompts based on your specific direction while
            maintaining the core concept and evaluation criteria.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
