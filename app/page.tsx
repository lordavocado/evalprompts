"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, TrendingUp, Eye, Target, Settings, ArrowLeft, Zap, Heart } from "lucide-react"
import { ApiKeySetup } from "@/components/api-key-setup"
import { ImageDescriptionChat } from "@/components/image-description-chat"
import { useSecureStorage } from "@/hooks/use-secure-storage"
import { generateCustomContent } from "./ai-actions"
import {
  generateImages,
  evaluatePromptsWithCriteria,
  refinePromptsWithCriteria,
  applyRecommendations,
  analyzeFavoritePatterns,
} from "./enhanced-actions"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"
import { ProductExplainer } from "@/components/product-explainer"
import { SEOHead } from "@/components/seo-head"
import { FluxModelSelector } from "@/components/flux-model-selector"
import { CriteriaCustomizer } from "@/components/criteria-customizer"
import { ImageFavorites } from "@/components/image-favorites"
import { FLUX_MODELS, getModelRecommendations, type FluxModel } from "@/types/flux-models"

interface PromptData {
  id: string
  text: string
  imageUrl?: string
  scores?: Record<string, number> & { overall: number }
  feedback?: string
  suggestions?: string[]
  iteration: number
}

interface EvaluationResult {
  prompts: PromptData[]
  comparison: string
  bestPrompt: string
  recommendations: string[]
  criteriaUsed: EvaluationCriteria
}

type AppStep = "api-setup" | "description" | "generating-content" | "evaluation"

interface FavoriteImage {
  id: string
  imageUrl: string
  prompt: string
  scores?: Record<string, number> & { overall: number }
  timestamp: number
  notes?: string
}

export default function PromptEvaluator() {
  const { apiKeys, saveApiKeys } = useSecureStorage()
  const [currentStep, setCurrentStep] = useState<AppStep>("api-setup")
  const [userDescription, setUserDescription] = useState("")
  const [customCriteria, setCustomCriteria] = useState<EvaluationCriteria | null>(null)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [showExplainer, setShowExplainer] = useState(true)

  const [prompts, setPrompts] = useState<PromptData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [isApplyingRecommendations, setIsApplyingRecommendations] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)
  const [currentIteration, setCurrentIteration] = useState(1)

  const [selectedFluxModel, setSelectedFluxModel] = useState<FluxModel>(FLUX_MODELS[0])
  const [recommendedModels, setRecommendedModels] = useState<FluxModel[]>([])
  const [favorites, setFavorites] = useState<FavoriteImage[]>([])

  // Dynamic SEO based on current step and user input
  const getSEOProps = () => {
    if (currentStep === "evaluation" && userDescription) {
      return {
        title: `EvalPrompts - Optimizing "${userDescription}" | AI Prompt Evaluation`,
        description: `Currently optimizing AI prompts for "${userDescription}" using advanced evaluation criteria and GPT-4o-mini analysis. Iteration ${currentIteration} in progress.`,
      }
    }

    if (currentStep === "description") {
      return {
        title: "Describe Your Vision | EvalPrompts - AI Prompt Optimization",
        description:
          "Tell EvalPrompts about your creative vision and get AI-generated evaluation criteria with optimized prompts tailored to your specific needs.",
      }
    }

    return {
      title: "EvalPrompts - AI Prompt Evaluation & Optimization Platform",
      description:
        "Transform your creative ideas into high-performing AI image generation prompts. Get AI-powered evaluation, custom criteria generation, and iterative optimization for better results.",
    }
  }

  const handleApiSetup = (keys: { openaiKey?: string; falKey?: string }) => {
    saveApiKeys(keys)
    setShowExplainer(false)
    setCurrentStep("description")
  }

  const handleDescriptionComplete = async (description: string) => {
    setUserDescription(description)
    setCurrentStep("generating-content")
    setIsGeneratingContent(true)

    try {
      const content = await generateCustomContent(description, apiKeys)
      setCustomCriteria(content.criteria)

      // Get model recommendations
      const modelRecs = getModelRecommendations(description, content.criteria)
      setRecommendedModels(modelRecs)
      if (modelRecs.length > 0) {
        setSelectedFluxModel(modelRecs[0])
      }

      // Set up the prompts
      const initialPrompts: PromptData[] = content.prompts.map((prompt, index) => ({
        id: `${index + 1}`,
        text: prompt,
        iteration: 1,
      }))

      setPrompts(initialPrompts)
      setCurrentStep("evaluation")
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsGeneratingContent(false)
    }
  }

  const updatePrompt = (id: string, text: string) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)))
  }

  const handleGenerateImages = async () => {
    setIsGenerating(true)
    try {
      const results = await generateImages(
        prompts.map((p) => p.text),
        selectedFluxModel,
        apiKeys,
      )

      setPrompts((prev) =>
        prev.map((p, index) => ({
          ...p,
          imageUrl: results[index],
        })),
      )

      const successCount = results.filter((url) => !url.includes("placeholder.svg")).length
      if (successCount === 0) {
        alert("Image generation failed for all prompts. Using placeholders for demonstration.")
      } else if (successCount < results.length) {
        alert(`Generated ${successCount} out of ${results.length} images successfully.`)
      }
    } catch (error) {
      console.error("Error generating images:", error)
      alert(`Error generating images: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEvaluatePrompts = async () => {
    if (!prompts.every((p) => p.imageUrl) || !customCriteria) {
      alert("Please generate images first")
      return
    }

    setIsEvaluating(true)
    try {
      const result = await evaluatePromptsWithCriteria(prompts, customCriteria, favorites, apiKeys)
      setEvaluationResult(result)
      setPrompts(result.prompts)
    } catch (error) {
      console.error("Error evaluating prompts:", error)
      alert(`Error evaluating prompts: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsEvaluating(false)
    }
  }

  const toggleFavorite = (promptId: string) => {
    const prompt = prompts.find((p) => p.id === promptId)
    if (!prompt || !prompt.imageUrl) return

    const favoriteId = `${promptId}-${Date.now()}`
    const existingFavorite = favorites.find((f) => f.prompt === prompt.text && f.imageUrl === prompt.imageUrl)

    if (existingFavorite) {
      setFavorites((prev) => prev.filter((f) => f.id !== existingFavorite.id))
    } else {
      const newFavorite: FavoriteImage = {
        id: favoriteId,
        imageUrl: prompt.imageUrl,
        prompt: prompt.text,
        scores: prompt.scores,
        timestamp: Date.now(),
      }
      setFavorites((prev) => [...prev, newFavorite])
    }
  }

  const removeFavorite = (favoriteId: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
  }

  const analyzeFavorites = async () => {
    if (favorites.length < 2) {
      throw new Error("Need at least 2 favorite images to analyze patterns.")
    }
    return await analyzeFavoritePatterns(favorites, apiKeys)
  }

  const applyFavoriteInsights = async (insights: {
    analysis: string
    recommendations: string[]
    styleInsights: string[]
  }) => {
    if (!customCriteria) return

    setIsApplyingRecommendations(true)
    try {
      const improvedPrompts = await applyRecommendations(
        prompts,
        insights.recommendations,
        customCriteria,
        favorites,
        apiKeys,
      )
      const newIteration = currentIteration + 1
      setPrompts(
        improvedPrompts.map((p) => ({ ...p, iteration: newIteration, imageUrl: undefined, scores: undefined })),
      )
      setCurrentIteration(newIteration)
      setEvaluationResult(null)
    } catch (error) {
      console.error("Error applying favorite insights:", error)
      alert(`Error applying insights: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsApplyingRecommendations(false)
    }
  }

  const handleApplyRecommendations = async () => {
    if (!evaluationResult || !customCriteria) {
      alert("Please evaluate prompts first")
      return
    }

    setIsApplyingRecommendations(true)
    try {
      const improvedPrompts = await applyRecommendations(
        prompts,
        evaluationResult.recommendations,
        customCriteria,
        favorites,
        apiKeys,
      )
      const newIteration = currentIteration + 1
      setPrompts(
        improvedPrompts.map((p) => ({ ...p, iteration: newIteration, imageUrl: undefined, scores: undefined })),
      )
      setCurrentIteration(newIteration)
      setEvaluationResult(null)
    } catch (error) {
      console.error("Error applying recommendations:", error)
      alert(`Error applying recommendations: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsApplyingRecommendations(false)
    }
  }

  const handleRefinePrompts = async () => {
    if (!evaluationResult || !customCriteria) {
      alert("Please evaluate prompts first")
      return
    }

    setIsRefining(true)
    try {
      const refinedPrompts = await refinePromptsWithCriteria(prompts, customCriteria, favorites, apiKeys)
      const newIteration = currentIteration + 1
      setPrompts(refinedPrompts.map((p) => ({ ...p, iteration: newIteration, imageUrl: undefined, scores: undefined })))
      setCurrentIteration(newIteration)
      setEvaluationResult(null)
    } catch (error) {
      console.error("Error refining prompts:", error)
      alert(`Error refining prompts: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRefining(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep("description")
    setUserDescription("")
    setCustomCriteria(null)
    setPrompts([])
    setEvaluationResult(null)
    setCurrentIteration(1)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent"
    if (score >= 6) return "Good"
    if (score >= 4) return "Fair"
    return "Poor"
  }

  const handleGetStarted = () => {
    setShowExplainer(false)
    setCurrentStep("api-setup")
  }

  const seoProps = getSEOProps()

  // Render different steps
  if (showExplainer) {
    return (
      <>
        <SEOHead {...seoProps} />
        <ProductExplainer onGetStarted={handleGetStarted} />
      </>
    )
  }

  if (currentStep === "api-setup") {
    return (
      <>
        <SEOHead
          title="API Setup | EvalPrompts - Configure Your AI Keys"
          description="Configure your OpenAI and Fal AI API keys to unlock the full potential of EvalPrompts. Secure client-side storage with privacy-first approach."
        />
        <ApiKeySetup onComplete={handleApiSetup} existingKeys={apiKeys} />
      </>
    )
  }

  if (currentStep === "description") {
    return (
      <>
        <SEOHead {...seoProps} />
        <ImageDescriptionChat onComplete={handleDescriptionComplete} apiKeys={apiKeys} />
      </>
    )
  }

  if (currentStep === "generating-content") {
    return (
      <>
        <SEOHead
          title="Generating Custom Criteria | EvalPrompts AI Working..."
          description={`EvalPrompts AI is analyzing "${userDescription}" and generating personalized evaluation criteria with optimized prompts.`}
        />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">EvalPrompts AI Working...</h2>
              <p className="text-gray-600 text-center">
                Analyzing your description and generating personalized criteria and optimized prompts...
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Main evaluation interface
  return (
    <>
      <SEOHead {...seoProps} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button variant="outline" onClick={handleStartOver} className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Start Over
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep("api-setup")} className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                API Settings
              </Button>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">EvalPrompts</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
              AI-powered prompt evaluation and optimization for: <strong>"{userDescription}"</strong>
            </p>

            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Sparkles className="w-4 h-4 mr-1" />
                Iteration {currentIteration}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                GPT-4o-mini Analysis
              </Badge>
            </div>
          </div>

          {/* Custom Criteria Display */}
          {customCriteria && (
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{customCriteria.icon}</span>
                  {customCriteria.name}
                  <Badge variant="secondary">AI Generated</Badge>
                </CardTitle>
                <CardDescription>{customCriteria.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(customCriteria.criteria).map(([key, criterion]) => (
                    <div key={key} className="text-center">
                      <div className="font-medium text-sm">{criterion.name}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {Math.round(criterion.weight * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flux Model Selector */}
          {customCriteria && (
            <FluxModelSelector
              selectedModel={selectedFluxModel}
              onSelect={setSelectedFluxModel}
              recommendedModels={recommendedModels}
            />
          )}

          {/* Criteria Customizer */}
          {customCriteria && <CriteriaCustomizer criteria={customCriteria} onUpdate={setCustomCriteria} />}

          {/* Image Favorites */}
          <ImageFavorites
            favorites={favorites}
            onRemoveFavorite={removeFavorite}
            onAnalyzeFavorites={analyzeFavorites}
            onApplyFavoriteInsights={applyFavoriteInsights}
          />

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {prompts.map((prompt, index) => (
              <Card key={prompt.id} className="relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    AI Prompt {index + 1}
                    {prompt.scores && (
                      <Badge className={getScoreColor(prompt.scores.overall)}>
                        {prompt.scores.overall.toFixed(1)}/10
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Iteration {prompt.iteration}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={prompt.text}
                    onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                    placeholder="AI-generated prompt..."
                    className="min-h-[100px]"
                  />

                  {prompt.imageUrl && (
                    <div className="relative">
                      <img
                        src={prompt.imageUrl || "/placeholder.svg"}
                        alt={`Generated from: ${prompt.text}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                          onClick={() => toggleFavorite(prompt.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.some((f) => f.prompt === prompt.text && f.imageUrl === prompt.imageUrl)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </Button>
                      </div>
                      {prompt.imageUrl.includes("placeholder.svg") && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <Badge variant="secondary" className="bg-white text-black">
                            Demo Placeholder
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {prompt.scores && customCriteria && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(customCriteria.criteria).map(([key, criterion]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 truncate">{criterion.name}:</span>
                            <span className={getScoreColor(prompt.scores?.[key] || 0)}>
                              {(prompt.scores?.[key] || 0).toFixed(1)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 col-span-2 border-t pt-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">Overall:</span>
                          <span className={getScoreColor(prompt.scores.overall)}>
                            {getScoreLabel(prompt.scores.overall)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button
              onClick={handleGenerateImages}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Images...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Images
                </>
              )}
            </Button>

            <Button
              onClick={handleEvaluatePrompts}
              disabled={isEvaluating || !prompts.every((p) => p.imageUrl)}
              size="lg"
              variant="outline"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with GPT-4o-mini...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Evaluate with AI Analysis
                </>
              )}
            </Button>

            {evaluationResult && (
              <Button
                onClick={handleApplyRecommendations}
                disabled={isApplyingRecommendations}
                size="lg"
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {isApplyingRecommendations ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying Recommendations...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Apply AI Recommendations
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={handleRefinePrompts}
              disabled={isRefining || !evaluationResult}
              size="lg"
              variant="outline"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  AI Refine Prompts
                </>
              )}
            </Button>
          </div>

          {/* Evaluation Results - No Tabs, Three Sections */}
          {evaluationResult && (
            <div className="space-y-6 mb-8">
              {/* AI Analysis Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    AI Analysis & Comparison
                    <Badge variant="outline" className="ml-2">
                      {evaluationResult.criteriaUsed.icon} {evaluationResult.criteriaUsed.name}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    GPT-4o-mini analysis of prompts and generated images using{" "}
                    {evaluationResult.criteriaUsed.description.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{evaluationResult.comparison}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Best Prompt Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Best Performing Prompt
                  </CardTitle>
                  <CardDescription>The highest-scoring prompt based on the custom evaluation criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-medium">{evaluationResult.bestPrompt}</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Recommendations
                    <Button
                      onClick={handleApplyRecommendations}
                      disabled={isApplyingRecommendations}
                      size="sm"
                      className="ml-auto bg-green-600 hover:bg-green-700"
                    >
                      {isApplyingRecommendations ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Apply All
                        </>
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Actionable suggestions to improve your prompts based on detailed analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evaluationResult.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-blue-800 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center py-8 mt-16 border-t border-gray-200 bg-white/50 rounded-lg">
            <p className="text-gray-600 mb-4">
              Made with <span className="text-red-500">♥</span> by Nichlas Campos
            </p>
            <p className="text-gray-500 text-sm mb-4">Feel free to connect on LinkedIn or X</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://www.linkedin.com/in/nichlaskvist/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://x.com/nkjorg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
