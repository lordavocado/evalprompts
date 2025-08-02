"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Eye, Trash2 } from "lucide-react"
import { FavoriteAnalysisModal } from "./favorite-analysis-modal"

interface FavoriteImage {
  id: string
  imageUrl: string
  prompt: string
  scores?: Record<string, number> & { overall: number }
  timestamp: number
  notes?: string
}

interface ImageFavoritesProps {
  favorites: FavoriteImage[]
  onRemoveFavorite: (id: string) => void
  onAnalyzeFavorites: () => Promise<{
    analysis: string
    recommendations: string[]
    styleInsights: string[]
  }>
  onApplyFavoriteInsights: (insights: {
    analysis: string
    recommendations: string[]
    styleInsights: string[]
  }) => void
}

export function ImageFavorites({
  favorites,
  onRemoveFavorite,
  onAnalyzeFavorites,
  onApplyFavoriteInsights,
}: ImageFavoritesProps) {
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([])
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: string
    recommendations: string[]
    styleInsights: string[]
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  if (favorites.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Favorite Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-mono-500">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No favorite images yet. Click the heart icon on generated images to save them here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const toggleSelection = (id: string) => {
    setSelectedFavorites((prev) => (prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]))
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-mono-900 font-semibold"
    if (score >= 6) return "text-mono-700 font-medium"
    return "text-mono-500"
  }

  const handleAnalyzeFavorites = async () => {
    if (favorites.length < 2) return

    setIsAnalyzing(true)
    setIsAnalysisModalOpen(true)
    setAnalysisResult(null)

    try {
      const result = await onAnalyzeFavorites()
      setAnalysisResult(result)
    } catch (error) {
      console.error("Error analyzing favorites:", error)
      setAnalysisResult({
        analysis: "Error analyzing favorites. Please try again.",
        recommendations: [],
        styleInsights: [],
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApplyInsights = () => {
    if (analysisResult) {
      onApplyFavoriteInsights(analysisResult)
    }
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-mono-700" />
              Favorite Images ({favorites.length})
            </div>
            <div className="flex gap-2">
              {selectedFavorites.length > 0 && <Badge variant="outline">{selectedFavorites.length} selected</Badge>}
              <Button
                onClick={handleAnalyzeFavorites}
                disabled={favorites.length < 2}
                size="sm"
                className="bg-mono-900 hover:bg-mono-800 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Analyze Patterns
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => (
              <Card
                key={favorite.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFavorites.includes(favorite.id) ? "ring-2 ring-mono-600" : ""
                }`}
                onClick={() => toggleSelection(favorite.id)}
              >
                <div className="relative">
                  <img
                    src={favorite.imageUrl || "/placeholder.svg"}
                    alt="Favorite image"
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveFavorite(favorite.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-mono-600" />
                    </Button>
                  </div>
                  {selectedFavorites.includes(favorite.id) && (
                    <div className="absolute top-2 left-2">
                      <div className="w-6 h-6 bg-mono-900 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-mono-600 line-clamp-2 mb-2">{favorite.prompt}</p>
                  {favorite.scores && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-mono-500">Overall Score:</span>
                      <Badge className={getScoreColor(favorite.scores.overall)} variant="outline">
                        {favorite.scores.overall.toFixed(1)}/10
                      </Badge>
                    </div>
                  )}
                  <div className="text-xs text-mono-400 mt-2">{new Date(favorite.timestamp).toLocaleDateString()}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {favorites.length >= 2 && (
            <div className="mt-4 p-4 bg-mono-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-mono-700" />
                <span className="font-medium text-mono-900">AI Pattern Analysis</span>
              </div>
              <p className="text-sm text-mono-700">
                The AI can analyze your favorite images to understand your preferences and improve future
                recommendations. This helps optimize prompts based on what you actually like, not just theoretical
                scores.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <FavoriteAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysis={analysisResult}
        isLoading={isAnalyzing}
        onApplyToPrompts={handleApplyInsights}
      />
    </>
  )
}
