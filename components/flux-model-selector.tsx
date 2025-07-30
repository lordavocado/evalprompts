"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FLUX_MODELS, type FluxModel } from "@/types/flux-models"
import { Check, Zap, Palette, Camera, Star } from "lucide-react"

interface FluxModelSelectorProps {
  selectedModel: FluxModel
  onSelect: (model: FluxModel) => void
  recommendedModels?: FluxModel[]
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "realistic":
      return <Camera className="w-4 h-4" />
    case "artistic":
      return <Palette className="w-4 h-4" />
    case "general":
      return <Zap className="w-4 h-4" />
    case "specialized":
      return <Star className="w-4 h-4" />
    default:
      return <Zap className="w-4 h-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "realistic":
      return "bg-green-100 text-green-800"
    case "artistic":
      return "bg-purple-100 text-purple-800"
    case "general":
      return "bg-blue-100 text-blue-800"
    case "specialized":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function FluxModelSelector({ selectedModel, onSelect, recommendedModels = [] }: FluxModelSelectorProps) {
  const [showAll, setShowAll] = useState(false)

  const displayModels = showAll ? FLUX_MODELS : FLUX_MODELS.slice(0, 3)
  const isRecommended = (model: FluxModel) => recommendedModels.some((r) => r.id === model.id)

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select Flux AI Model</h3>
        <p className="text-gray-600">Choose the AI model that best fits your use case</p>
        {recommendedModels.length > 0 && (
          <div className="mt-2">
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <Star className="w-3 h-3 mr-1" />
              AI Recommended Models Available
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayModels.map((model) => (
          <Card
            key={model.id}
            className={`cursor-pointer transition-all hover:shadow-lg relative ${
              selectedModel.id === model.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => onSelect(model)}
          >
            {isRecommended(model) && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  AI Pick
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(model.category)}
                  {model.name}
                </div>
                {selectedModel.id === model.id && <Check className="w-5 h-5 text-blue-600" />}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(model.category)} variant="secondary">
                  {model.category}
                </Badge>
              </div>
              <CardDescription className="text-sm">{model.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Strengths:</h4>
                  <div className="flex flex-wrap gap-1">
                    {model.strengths.slice(0, 3).map((strength, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Best for:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {model.bestFor.slice(0, 2).map((use, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!showAll && FLUX_MODELS.length > 3 && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => setShowAll(true)} className="bg-transparent">
            Show All Models ({FLUX_MODELS.length - 3} more)
          </Button>
        </div>
      )}

      {selectedModel && (
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(selectedModel.category)}
              Selected: {selectedModel.name}
              {isRecommended(selectedModel) && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  AI Recommended
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{selectedModel.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Key Strengths:</h4>
                <div className="space-y-1">
                  {selectedModel.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-3 h-3 text-green-600" />
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Optimal Use Cases:</h4>
                <div className="space-y-1">
                  {selectedModel.bestFor.map((use, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Star className="w-3 h-3 text-blue-600" />
                      {use}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
