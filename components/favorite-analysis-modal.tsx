"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Eye, Zap, Lightbulb, TrendingUp, CheckCircle } from "lucide-react"

interface FavoriteAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  analysis: {
    analysis: string
    recommendations: string[]
    styleInsights: string[]
  } | null
  isLoading: boolean
  onApplyToPrompts: () => void
}

export function FavoriteAnalysisModal({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onApplyToPrompts,
}: FavoriteAnalysisModalProps) {
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyToPrompts = async () => {
    setIsApplying(true)
    try {
      await onApplyToPrompts()
    } finally {
      setIsApplying(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Favorite Images Analysis
          </DialogTitle>
          <DialogDescription>
            AI analysis of your favorite images to understand your preferences and improve future prompts
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            <h3 className="text-lg font-semibold">Analyzing Your Favorites...</h3>
            <p className="text-gray-600 text-center">
              Our AI is studying your favorite images to identify patterns and preferences
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Main Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pattern Analysis
                </CardTitle>
                <CardDescription>Comprehensive analysis of your visual preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{analysis.analysis}</p>
                </div>
              </CardContent>
            </Card>

            {/* Style Insights */}
            {analysis.styleInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Key Style Insights
                  </CardTitle>
                  <CardDescription>Visual patterns identified in your favorite images</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.styleInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100"
                      >
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-purple-800 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actionable Recommendations */}
            {analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Actionable Recommendations
                    </div>
                    <Button
                      onClick={handleApplyToPrompts}
                      disabled={isApplying}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Apply to Current Prompts
                        </>
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription>Specific improvements based on your demonstrated preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100"
                      >
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-green-800 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Badge variant="outline" className="text-sm">
                <Eye className="w-3 h-3 mr-1" />
                Analysis Complete
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {analysis.recommendations.length > 0 && (
                  <Button
                    onClick={handleApplyToPrompts}
                    disabled={isApplying}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Applying Insights...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Apply All Insights
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No analysis available. Please try again.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
