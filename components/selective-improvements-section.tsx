"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Target, Zap, Loader2, TrendingUp, Send } from "lucide-react"

interface EvaluationResult {
  prompts: any[]
  comparison: string
  bestPrompt: string
  recommendations: string[]
  criteriaUsed: any
}

interface SelectiveImprovementsSectionProps {
  evaluationResult: EvaluationResult
  onApplyImprovements: (selectedRecommendations: string[]) => void
  isApplyingImprovements: boolean
}

export function SelectiveImprovementsSection({
  evaluationResult,
  onApplyImprovements,
  isApplyingImprovements,
}: SelectiveImprovementsSectionProps) {
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>(evaluationResult.recommendations)

  // Format text to handle basic formatting
  const formatText = (text: string) => {
    return text
      .split("\n")
      .map((line, index) => {
        // Handle numbered lists
        if (line.match(/^\d+\./)) {
          return (
            <div key={index} className="flex items-start gap-2 mb-2">
              <span className="font-semibold text-gray-900 min-w-[20px]">{line.match(/^\d+/)?.[0]}.</span>
              <span>{line.replace(/^\d+\.\s*/, "")}</span>
            </div>
          )
        }
        // Handle bullet points
        if (line.match(/^[-•]\s/)) {
          return (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-gray-900 min-w-[10px]">•</span>
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

  const toggleRecommendation = (recommendation: string) => {
    setSelectedRecommendations((prev) =>
      prev.includes(recommendation) ? prev.filter((r) => r !== recommendation) : [...prev, recommendation],
    )
  }

  const selectAll = () => {
    setSelectedRecommendations(evaluationResult.recommendations)
  }

  const selectNone = () => {
    setSelectedRecommendations([])
  }

  const handleApplySelected = () => {
    if (selectedRecommendations.length === 0) {
      alert("Please select at least one improvement")
      return
    }
    onApplyImprovements(selectedRecommendations)
  }

  const handleQuickApplyAll = () => {
    setSelectedRecommendations(evaluationResult.recommendations)
    onApplyImprovements(evaluationResult.recommendations)
  }

  return (
    <div className="space-y-6 mb-8">
      {/* AI Analysis Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Eye className="w-5 h-5" />
            AI Analysis Summary
            <Badge variant="outline" className="ml-2 border-gray-300 text-gray-700">
              {evaluationResult.criteriaUsed.icon} {evaluationResult.criteriaUsed.name}
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Quick analysis based on your custom evaluation criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-gray-700 leading-relaxed space-y-2">{formatText(evaluationResult.comparison)}</div>
        </CardContent>
      </Card>

      {/* Best Prompt Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Target className="w-5 h-5" />
            Top Performing Prompt
          </CardTitle>
          <CardDescription className="text-gray-600">The prompt that scored highest on your criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <p className="text-gray-900 font-medium leading-relaxed">{evaluationResult.bestPrompt}</p>
          </div>
        </CardContent>
      </Card>

      {/* Selective Improvements Section */}
      <Card className="border-2 border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5" />
              Improve Your Prompts
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleQuickApplyAll}
                disabled={isApplyingImprovements}
                size="sm"
                variant="outline"
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {isApplyingImprovements ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 mr-1" />
                    Quick Apply All
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-gray-600">
            <strong>Select specific improvements</strong> to apply to your prompts for precise optimization control.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Controls */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedRecommendations.length} of {evaluationResult.recommendations.length} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectAll}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectNone}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Select None
                </Button>
              </div>
            </div>
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              {selectedRecommendations.length} improvements
            </Badge>
          </div>

          {/* Recommendations List */}
          <div className="space-y-3">
            {evaluationResult.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedRecommendations.includes(rec)
                    ? "bg-white border-gray-300 shadow-sm"
                    : "bg-gray-25 border-gray-200 hover:bg-white hover:border-gray-300"
                }`}
                onClick={() => toggleRecommendation(rec)}
              >
                <Checkbox
                  checked={selectedRecommendations.includes(rec)}
                  onCheckedChange={() => toggleRecommendation(rec)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 float-left mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-gray-900 leading-relaxed">{formatText(rec)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Apply Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedRecommendations.length > 0 && (
                <span>
                  <strong>{selectedRecommendations.length}</strong> improvements selected
                </span>
              )}
            </div>
            <Button
              onClick={handleApplySelected}
              disabled={isApplyingImprovements || selectedRecommendations.length === 0}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isApplyingImprovements ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying Selected Improvements...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Apply Selected Improvements
                  {selectedRecommendations.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                      {selectedRecommendations.length}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>💡 How it works:</strong> The AI will rewrite your prompts incorporating only your selected
              improvements. This gives you precise control over the optimization process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
