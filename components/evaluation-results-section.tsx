"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Target, Zap, Loader2, TrendingUp } from "lucide-react"

interface EvaluationResult {
  prompts: any[]
  comparison: string
  bestPrompt: string
  recommendations: string[]
  criteriaUsed: any
}

interface EvaluationResultsSectionProps {
  evaluationResult: EvaluationResult
  onApplyRecommendations: () => void
  isApplyingRecommendations: boolean
}

export function EvaluationResultsSection({
  evaluationResult,
  onApplyRecommendations,
  isApplyingRecommendations,
}: EvaluationResultsSectionProps) {
  // Format text to handle basic formatting
  const formatText = (text: string) => {
    return text
      .split("\n")
      .map((line, index) => {
        // Handle numbered lists
        if (line.match(/^\d+\./)) {
          return (
            <div key={index} className="flex items-start gap-2 mb-2">
              <span className="font-semibold text-blue-600 min-w-[20px]">{line.match(/^\d+/)?.[0]}.</span>
              <span>{line.replace(/^\d+\.\s*/, "")}</span>
            </div>
          )
        }
        // Handle bullet points
        if (line.match(/^[-•]\s/)) {
          return (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-blue-600 min-w-[10px]">•</span>
              <span>{line.replace(/^[-•]\s*/, "")}</span>
            </div>
          )
        }
        // Handle bold text
        if (line.includes("**")) {
          const parts = line.split("**")
          return (
            <p key={index} className="mb-2">
              {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
            </p>
          )
        }
        // Regular paragraphs
        if (line.trim()) {
          return (
            <p key={index} className="mb-2">
              {line}
            </p>
          )
        }
        return null
      })
      .filter(Boolean)
  }

  return (
    <div className="space-y-6 mb-8">
      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            AI Analysis Summary
            <Badge variant="outline" className="ml-2">
              {evaluationResult.criteriaUsed.icon} {evaluationResult.criteriaUsed.name}
            </Badge>
          </CardTitle>
          <CardDescription>Quick analysis based on your custom evaluation criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-gray-700 leading-relaxed space-y-2">{formatText(evaluationResult.comparison)}</div>
        </CardContent>
      </Card>

      {/* Best Prompt Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Top Performing Prompt
          </CardTitle>
          <CardDescription>The prompt that scored highest on your criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-800 font-medium leading-relaxed">{evaluationResult.bestPrompt}</p>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Actions Section */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Improve Your Prompts
            </div>
            <Button
              onClick={onApplyRecommendations}
              disabled={isApplyingRecommendations}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isApplyingRecommendations ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Apply Improvements
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            <strong>What this does:</strong> The AI will rewrite your prompts to address these specific improvement
            areas, then you can generate new images to see the results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {evaluationResult.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="text-orange-900 leading-relaxed">{formatText(rec)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>💡 How it works:</strong> Click "Apply Improvements" to let the AI rewrite your prompts based on
              these recommendations. This creates new, improved versions that you can then generate images from.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
