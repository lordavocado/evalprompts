"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Shuffle, Zap } from "lucide-react"

type VariationMode = "identical" | "variations" | "radical"

interface PromptVariationSelectorProps {
  selectedMode: VariationMode
  onModeChange: (mode: VariationMode) => void
}

export function PromptVariationSelector({ selectedMode, onModeChange }: PromptVariationSelectorProps) {
  const modes = [
    {
      id: "identical" as VariationMode,
      name: "Identical Prompts",
      description: "All 3 prompts will be exactly the same",
      icon: <Copy className="w-4 h-4" />,
      badge: "Same",
    },
    {
      id: "variations" as VariationMode,
      name: "Small Variations",
      description: "3 similar prompts with minor differences",
      icon: <Shuffle className="w-4 h-4" />,
      badge: "Default",
    },
    {
      id: "radical" as VariationMode,
      name: "Radical Differences",
      description: "3 completely different approaches to your concept",
      icon: <Zap className="w-4 h-4" />,
      badge: "Diverse",
    },
  ]

  return (
    <Card className="mb-6 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Shuffle className="w-5 h-5" />
          Prompt Generation Mode
        </CardTitle>
        <CardDescription className="text-gray-600">Choose how the AI should create your 3 prompts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((mode) => (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all hover:shadow-md border ${
                selectedMode === mode.id
                  ? "border-gray-900 bg-gray-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onModeChange(mode.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    {mode.icon}
                    {mode.name}
                  </div>
                  <Badge
                    variant={selectedMode === mode.id ? "default" : "outline"}
                    className={selectedMode === mode.id ? "bg-gray-900 text-white" : "border-gray-300 text-gray-600"}
                  >
                    {mode.badge}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">{mode.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {selectedMode && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {modes.find((m) => m.id === selectedMode)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
