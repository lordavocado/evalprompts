"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Eye, Settings, ArrowLeft, Heart, BarChart3, Info, Wand2 } from "lucide-react"
import { ApiKeySetup } from "@/components/api-key-setup"
import { ImageDescriptionChat } from "@/components/image-description-chat"
import { useSecureStorage } from "@/hooks/use-secure-storage"
import { useUsageTracking } from "@/hooks/use-usage-tracking"
import { usePromptHistory } from "@/hooks/use-prompt-history"
import { generateCustomContent } from "./ai-actions"
import {
  generateImages,
  evaluatePromptsWithCriteria,
  improvePromptsSelectively,
  analyzeFavoritePatterns,
  applyCustomDirection,
} from "./enhanced-actions"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"
import { ProductExplainer } from "@/components/product-explainer"
import { SEOHead } from "@/components/seo-head"
import { FluxModelSelector } from "@/components/flux-model-selector"
import { InlineCriteriaEditor } from "@/components/inline-criteria-editor"
import { ImageFavorites } from "@/components/image-favorites"
import { ImageDownloadButton } from "@/components/image-download-button"
import { UsageStatsWidget } from "@/components/usage-stats-widget"
import { UsageStatsModal } from "@/components/usage-stats-modal"
import { Progress } from "@/components/ui/progress"
import { PromptHistoryPanel, CompactPromptHistory } from "@/components/prompt-history-panel"
import { SelectiveImprovementsSection } from "@/components/selective-improvements-section"

import { CustomDirectionInput } from "@/components/custom-direction-input"
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
type VariationMode = "identical" | "variations" | "radical"

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
  const { stats, trackFalRequest, trackOpenAIRequest, resetStats, getRecentRequests } = useUsageTracking()
  const [currentStep, setCurrentStep] = useState<AppStep>("api-setup")
  const [userDescription, setUserDescription] = useState("")
  const [customCriteria, setCustomCriteria] = useState<EvaluationCriteria | null>(null)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [showExplainer, setShowExplainer] = useState(true)
  const [showUsageModal, setShowUsageModal] = useState(false)

  const {
    prompts,
    updatePrompts,
    undo,
    redo,
    canUndo,
    canRedo,
    currentEntry,
    history,
    navigateToEntry,
    initialize,
    addImageGeneration,
    addEvaluation,
    addImprovement,
    addCustomDirection,
    setPrompts
  } = usePromptHistory()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)
  const [currentIteration, setCurrentIteration] = useState(1)

  const [selectedFluxModel, setSelectedFluxModel] = useState<FluxModel>(FLUX_MODELS[0])
  const [recommendedModels, setRecommendedModels] = useState<FluxModel[]>([])
  const [favorites, setFavorites] = useState<FavoriteImage[]>([])
  const [variationMode, setVariationMode] = useState<VariationMode>("variations")
  const [hasGeneratedImages, setHasGeneratedImages] = useState(false)
  const [showImprovePrompts, setShowImprovePrompts] = useState(false)

  // Dynamic SEO based on current step and user input
  const getSEOProps = () => {
    if (currentStep === "evaluation" && userDescription) {
      return {
        title: `EvalPrompts - Optimizing "${userDescription}" | AI Prompt Evaluation`,
        description: `Currently optimizing AI prompts for "${userDescription}" using advanced evaluation criteria and GPT-5-mini analysis. Iteration ${currentIteration} in progress.`,
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
      const content = await generateCustomContent(description, apiKeys, variationMode)
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

      initialize(initialPrompts, "Generated initial prompts from description")
      setCurrentStep("evaluation")
    } catch (error) {
      console.error("Error generating content:", error)
      alert(`Error generating content: ${error instanceof Error ? error.message : String(error)}`)
      setCurrentStep("api-setup")
    } finally {
      setIsGeneratingContent(false)
    }
  }

  const updatePrompt = (id: string, text: string) => {
    const newPrompts = prompts.map((p) => (p.id === id ? { ...p, text } : p))
    setPrompts(newPrompts)
  }

  const handleGenerateImages = async () => {
    setIsGenerating(true)
    
    try {
      const results = await generateImages(
        prompts.map((p) => p.text),
        selectedFluxModel,
        apiKeys,
      )
      
      // Track usage client-side after successful generation
      const successCount = results.length
      if (successCount > 0) {
        trackFalRequest(selectedFluxModel.endpoint, successCount)
      }

      const promptsWithImages = prompts.map((p, index) => ({
        ...p,
        imageUrl: results[index],
      }))
      
      addImageGeneration(promptsWithImages)
      setHasGeneratedImages(true)
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
      const result = await evaluatePromptsWithCriteria(prompts, customCriteria, favorites, apiKeys, trackOpenAIRequest)
      setEvaluationResult(result)
      addEvaluation(result.prompts)
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
    return await analyzeFavoritePatterns(favorites, apiKeys, trackOpenAIRequest)
  }

  const applyFavoriteInsights = async (insights: {
    analysis: string
    recommendations: string[]
    styleInsights: string[]
  }) => {
    if (!customCriteria) return

    setIsImproving(true)
    try {
      const improvedPrompts = await improvePromptsSelectively(
        prompts,
        insights.recommendations,
        customCriteria,
        favorites,
        apiKeys,
        trackOpenAIRequest,
      )
      const newIteration = currentIteration + 1
      const newPrompts = improvedPrompts.map((p) => ({ ...p, iteration: newIteration, imageUrl: undefined, scores: undefined }))
      addImprovement(newPrompts, "favorite insights")
      setCurrentIteration(newIteration)
      setEvaluationResult(null)
    } catch (error) {
      console.error("Error applying favorite insights:", error)
      alert(`Error applying insights: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsImproving(false)
    }
  }

  const handleSelectiveImprovements = async (selectedRecommendations: string[]) => {
    if (!customCriteria) {
      alert("Please evaluate prompts first")
      return
    }

    setIsImproving(true)
    try {
      const improvedPrompts = await improvePromptsSelectively(
        prompts,
        selectedRecommendations,
        customCriteria,
        favorites,
        apiKeys,
        trackOpenAIRequest,
      )
      const newIteration = currentIteration + 1
      const newPrompts = improvedPrompts.map((p) => ({ ...p, iteration: newIteration, imageUrl: undefined, scores: undefined }))
      addImprovement(newPrompts, "selected improvements")
      setCurrentIteration(newIteration)
      setEvaluationResult(null)
    } catch (error) {
      console.error("Error improving prompts:", error)
      alert(`Error improving prompts: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsImproving(false)
    }
  }

  const handleCustomDirection = async (direction: string) => {
    if (!customCriteria) {
      alert("Please set up evaluation criteria first")
      return
    }

    setIsImproving(true)
    try {
      const improvedPrompts = await applyCustomDirection(
        prompts,
        direction,
        customCriteria,
        favorites,
        apiKeys,
        trackOpenAIRequest,
      )
      const newIteration = currentIteration + 1
      const newPrompts = improvedPrompts.map((p) => ({ ...p, iteration: newIteration, imageUrl: undefined, scores: undefined }))
      addCustomDirection(newPrompts, direction)
      setCurrentIteration(newIteration)
      setEvaluationResult(null)
    } catch (error) {
      console.error("Error applying custom direction:", error)
      alert(`Error applying direction: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsImproving(false)
    }
  }

  const handleImprovePrompts = async () => {
    if (!customCriteria) {
      alert("Please set up evaluation criteria first")
      return
    }

    setIsImproving(true)
    try {
      // Use AI to improve prompts based on current images and evaluation
      const improvedPrompts = await improvePromptsSelectively(
        prompts,
        ["visual_analysis", "composition", "quality", "adherence"],
        customCriteria,
        favorites,
        apiKeys,
        trackOpenAIRequest,
      )
      const newIteration = currentIteration + 1
      const newPrompts = improvedPrompts.map((p) => ({ ...p, iteration: newIteration, imageUrl: undefined, scores: undefined }))
      addImprovement(newPrompts, "AI image analysis")
      setCurrentIteration(newIteration)
      setEvaluationResult(null)
      setShowImprovePrompts(false)
    } catch (error) {
      console.error("Error improving prompts:", error)
      alert(`Error improving prompts: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsImproving(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep("description")
    setUserDescription("")
    setCustomCriteria(null)
    setPrompts([])
    setEvaluationResult(null)
    setCurrentIteration(1)
    setVariationMode("variations")
    setHasGeneratedImages(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-mono-900"
    if (score >= 6) return "text-mono-700"
    return "text-mono-500"
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            <ImageDescriptionChat
              onComplete={handleDescriptionComplete}
              apiKeys={apiKeys}
              variationMode={variationMode}
              onVariationModeChange={setVariationMode}
            />
          </div>
        </div>
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
        <div className="min-h-screen bg-white">
          <div className="fixed top-0 left-0 right-0 z-50">
            <Progress value={30} className="h-1" />
          </div>
          <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-mono-700" />
            <p className="text-mono-600">Analyzing your description and generating criteria & prompts...</p>
          </div>
        </div>
      </>
    )
  }

  // Main evaluation interface
  return (
    <>
      <SEOHead {...seoProps} />
      {(isGeneratingContent || isGenerating || isEvaluating || isImproving) && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={isGeneratingContent ? 25 : isGenerating ? 50 : isEvaluating ? 75 : 60} className="h-1" />
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-8">
                         <div className="flex items-center justify-center gap-4 mb-4">
               <Button
                 variant="outline"
                 onClick={handleStartOver}
                 className="flex items-center gap-2 border-mono-300 text-mono-700 hover:bg-mono-50 bg-white"
               >
                 <ArrowLeft className="w-4 h-4" />
                 Start Over
               </Button>
             </div>

            <div className="flex items-center justify-center gap-6 text-sm mb-3">
              {(() => {
                const steps = ["Describe", "Generate", "Evaluate", "Improve"]
                let active = 0
                if (currentStep === "description") active = 0
                else if (currentStep === "generating-content") active = 1
                else if (currentStep === "evaluation") active = evaluationResult ? 3 : (hasGeneratedImages ? 2 : 1)
                return (
                  <div className="flex items-center gap-4">
                    {steps.map((label, idx) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${idx <= active ? 'bg-mono-900' : 'bg-mono-300'}`} />
                        <span className={`${idx === active ? 'text-mono-900 font-medium' : 'text-mono-500'}`}>{label}</span>
                        {idx < steps.length - 1 && <span className="text-mono-400">›</span>}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
            <h1 className="text-4xl font-bold text-mono-900 mb-4">EvalPrompts</h1>
            <p className="text-lg text-mono-600 max-w-3xl mx-auto mb-6">
              AI-powered prompt evaluation and optimization for: <strong>"{userDescription}"</strong>
            </p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge variant="outline" className="text-sm border-mono-300 text-mono-700 bg-white">
                Iteration {currentIteration}
              </Badge>
              <Badge variant="outline" className="text-sm border-mono-300 text-mono-700 bg-white">
                {variationMode === "identical" ? "Identical Prompts" : variationMode === "radical" ? "Radical Differences" : "Small Variations"}
              </Badge>
              <Badge variant="outline" className="text-sm border-mono-300 text-mono-700 bg-white">
                GPT-5-mini Analysis
              </Badge>
            </div>

            {/* Compact History Controls */}
            <div className="flex justify-center">
              <CompactPromptHistory
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                currentEntry={currentEntry}
              />
            </div>
          </div>

          {/* Usage Stats Widget */}
          <UsageStatsWidget stats={stats} onOpenModal={() => setShowUsageModal(true)} />

          {/* Inline Criteria Editor */}
          {customCriteria && (
            <div className="mb-2 flex items-center gap-2">
              <InlineCriteriaEditor criteria={customCriteria} onUpdate={setCustomCriteria} />
            </div>
          )}

          {/* Flux Model Selector */}
          {customCriteria && (
            <FluxModelSelector
              selectedModel={selectedFluxModel}
              onSelect={setSelectedFluxModel}
              recommendedModels={recommendedModels}
            />
          )}

          {/* Prompt History Panel */}
          {/* Full PromptHistoryPanel hidden by default to reduce clutter */}

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {prompts.map((prompt, index) => (
              <Card key={prompt.id} className="relative overflow-hidden border-mono-200 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-mono-900">
                    AI Prompt {index + 1}
                    {prompt.scores && (
                      <Badge className={`${getScoreColor(prompt.scores.overall)} border-mono-300 bg-white`} variant="outline">
                        {prompt.scores.overall.toFixed(1)}/10
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-mono-600">Iteration {prompt.iteration}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={prompt.text}
                    onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                    placeholder="AI-generated prompt..."
                    className="min-h-[200px] border-mono-300 focus:border-mono-500 focus:ring-mono-500"
                  />

                  {prompt.imageUrl && (
                    <div className="relative">
                      <img
                        src={prompt.imageUrl || "/placeholder.svg"}
                        alt={`Generated from: ${prompt.text}`}
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <ImageDownloadButton
                          imageUrl={prompt.imageUrl}
                          filename={`evalprompts-prompt-${prompt.id}-iter-${prompt.iteration}.png`}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                          onClick={() => toggleFavorite(prompt.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.some((f) => f.prompt === prompt.text && f.imageUrl === prompt.imageUrl)
                                ? "fill-gray-900 text-gray-900"
                                : "text-gray-600"
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  )}

                  {prompt.scores && customCriteria && (
                    <div className="space-y-3">
                      <div className="space-y-3">
                        {Object.entries(customCriteria.criteria).map(([key, criterion]) => {
                          const value = prompt.scores?.[key] || 0
                          const percent = Math.round((value / 10) * 100)
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-mono-500 truncate">{criterion.name}</span>
                                <span className={`font-medium ${getScoreColor(value)}`}>
                                  {getScoreLabel(value)} ({value.toFixed(1)})
                                </span>
                              </div>
                              <Progress value={percent} className="h-1.5" />
                            </div>
                          )
                        })}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">Overall:</span>
                          <span className={getScoreColor(prompt.scores.overall)}>
                            {getScoreLabel(prompt.scores.overall)} ({prompt.scores.overall.toFixed(1)})
                          </span>
                        </div>
                      </div>
                      {prompt.feedback && (
                        <div className="text-xs text-mono-600 bg-mono-50 p-2 rounded">
                          <strong>AI Feedback:</strong> {prompt.feedback}
                        </div>
                      )}
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
              className="bg-mono-900 hover:bg-mono-800 text-white"
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
              className="border-mono-300 text-mono-700 hover:bg-mono-50 bg-white"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Evaluate with AI
                </>
              )}
            </Button>

          </div>

          {/* Image Favorites - Only show after first generation */}
          {hasGeneratedImages && (
            <ImageFavorites
              favorites={favorites}
              onRemoveFavorite={removeFavorite}
              onAnalyzeFavorites={analyzeFavorites}
              onApplyFavoriteInsights={applyFavoriteInsights}
            />
          )}

          {/* Custom Direction Input - Only show after first generation */}
          {hasGeneratedImages && customCriteria && (
            <CustomDirectionInput onApplyDirection={handleCustomDirection} isApplying={isImproving} />
          )}

          {/* Selective Improvements Results */}
          {evaluationResult && (
            <SelectiveImprovementsSection
              evaluationResult={evaluationResult}
              onApplyImprovements={handleSelectiveImprovements}
              isApplyingImprovements={isImproving}
            />
          )}

          {/* Improve Prompts Modal */}
          {showImprovePrompts && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-mono-900">Improve Your Prompts</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowImprovePrompts(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-sm text-mono-600">
                      AI analysis of your generated images and suggestions for improvement:
                    </div>
                    
                    {prompts.map((prompt) => (
                      <Card key={prompt.id} className="border-mono-200">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {prompt.imageUrl && (
                              <img
                                src={prompt.imageUrl}
                                alt="Generated image"
                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 space-y-2">
                              <p className="text-sm font-medium text-mono-900">
                                Current: "{prompt.text}"
                              </p>
                              {prompt.scores && (
                                <p className="text-xs text-mono-600">
                                  Overall Score: {prompt.scores.overall}/10
                                </p>
                              )}
                              {prompt.feedback && (
                                <p className="text-xs text-mono-600 bg-mono-50 p-2 rounded">
                                  {prompt.feedback}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="flex gap-3 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowImprovePrompts(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleImprovePrompts}
                        disabled={isImproving}
                        className="bg-mono-900 hover:bg-mono-800 text-white"
                      >
                        {isImproving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Improving...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Apply AI Improvements
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usage Stats Modal */}
          <UsageStatsModal
            isOpen={showUsageModal}
            onClose={() => setShowUsageModal(false)}
            stats={stats}
            onReset={resetStats}
            recentRequests={getRecentRequests()}
          />

          {/* Top progress bar replaces blocking overlays */}

          {/* Footer */}
          <footer className="text-center py-12 mt-16 border-t border-mono-200">
            <p className="text-mono-600 mb-4">
              Made with <span className="text-mono-900">♥</span> by Nichlas Campos
            </p>
            <p className="text-mono-500 text-sm mb-6">Feel free to connect on LinkedIn or X</p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep("api-setup")} className="border-mono-300">API Settings</Button>
                <Button variant="outline" size="sm" onClick={() => setShowUsageModal(true)} className="border-mono-300">Usage Stats</Button>
              </div>
              <div className="flex items-center justify-center gap-6">
                <a
                  href="https://www.linkedin.com/in/nichlaskvist/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mono-600 hover:text-mono-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/nkjorg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mono-600 hover:text-mono-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
