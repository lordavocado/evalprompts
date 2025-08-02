"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles, Brain, Image, Target, X } from "lucide-react"

interface LoadingStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  estimatedDuration: number // in seconds
}

interface EnhancedLoadingOverlayProps {
  isVisible: boolean
  title: string
  steps: LoadingStep[]
  currentStepId?: string
  progress?: number
  onCancel?: () => void
  className?: string
}

const defaultSteps: LoadingStep[] = [
  {
    id: "analyze",
    label: "Analyzing Description",
    description: "Understanding your vision and requirements",
    icon: <Brain className="w-5 h-5" />,
    estimatedDuration: 3
  },
  {
    id: "criteria",
    label: "Generating Criteria",
    description: "Creating custom evaluation framework",
    icon: <Target className="w-5 h-5" />,
    estimatedDuration: 5
  },
  {
    id: "prompts",
    label: "Optimizing Prompts",
    description: "Crafting AI-optimized image generation prompts",
    icon: <Sparkles className="w-5 h-5" />,
    estimatedDuration: 4
  }
]

export function EnhancedLoadingOverlay({
  isVisible,
  title,
  steps = defaultSteps,
  currentStepId,
  progress,
  onCancel,
  className = ""
}: EnhancedLoadingOverlayProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)

  // Find current step
  const currentStep = currentStepId 
    ? steps.find(step => step.id === currentStepId)
    : steps[currentStepIndex]

  // Calculate estimated total time
  const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedDuration, 0)

  // Auto-advance through steps if no specific step is provided
  useEffect(() => {
    if (!isVisible) {
      setElapsedTime(0)
      setCurrentStepIndex(0)
      setStepProgress(0)
      return
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 0.1)
      
      if (!currentStepId) {
        // Auto-calculate progress based on time
        let accumulatedTime = 0
        let newStepIndex = 0
        
        for (let i = 0; i < steps.length; i++) {
          if (elapsedTime >= accumulatedTime && elapsedTime < accumulatedTime + steps[i].estimatedDuration) {
            newStepIndex = i
            const stepElapsed = elapsedTime - accumulatedTime
            setStepProgress((stepElapsed / steps[i].estimatedDuration) * 100)
            break
          }
          accumulatedTime += steps[i].estimatedDuration
          if (elapsedTime >= accumulatedTime) {
            newStepIndex = i + 1
            setStepProgress(0)
          }
        }
        
        setCurrentStepIndex(Math.min(newStepIndex, steps.length - 1))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isVisible, currentStepId, elapsedTime, steps])

  // Calculate overall progress
  const overallProgress = progress !== undefined 
    ? progress 
    : Math.min((elapsedTime / totalEstimatedTime) * 100, 100)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <Card className={`w-full max-w-2xl border-mono-200 ${className}`}>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mono-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-mono-700 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-mono-900">{title}</h3>
                  <p className="text-sm text-mono-600">AI is working on your request...</p>
                </div>
              </div>
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-mono-500 hover:text-mono-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-mono-600">Overall Progress</span>
                <span className="text-mono-900 font-medium">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-mono-500">
                <span>Estimated time: {totalEstimatedTime}s</span>
                <span>Elapsed: {elapsedTime.toFixed(1)}s</span>
              </div>
            </div>

            {/* Current Step Highlight */}
            {currentStep && (
              <div className="p-4 bg-mono-50 rounded-lg border border-mono-200">
                <div className="flex items-center gap-3">
                  <div className="text-mono-700">
                    {currentStep.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-mono-900">{currentStep.label}</h4>
                    <p className="text-sm text-mono-700">{currentStep.description}</p>
                  </div>
                  <Loader2 className="w-4 h-4 text-mono-700 animate-spin" />
                </div>
                {!currentStepId && (
                  <div className="mt-3">
                    <Progress value={stepProgress} className="h-1" />
                  </div>
                )}
              </div>
            )}

            {/* Steps Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {steps.map((step, index) => {
                const isCompleted = currentStepId 
                  ? false // Let parent control completion
                  : currentStepIndex > index
                const isCurrent = currentStepId 
                  ? step.id === currentStepId
                  : currentStepIndex === index
                const isPending = !isCompleted && !isCurrent

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent 
                        ? "bg-mono-100 border-mono-300" 
                        : isCompleted 
                        ? "bg-mono-50 border-mono-200"
                        : "bg-mono-50 border-mono-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`${
                        isCurrent ? "text-mono-800" : 
                        isCompleted ? "text-mono-700" : 
                        "text-mono-400"
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        isCurrent ? "text-mono-900" : 
                        isCompleted ? "text-mono-800" : 
                        "text-mono-600"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${
                      isCurrent ? "text-mono-700" : 
                      isCompleted ? "text-mono-600" : 
                      "text-mono-500"
                    }`}>
                      {step.description}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Fun Facts or Tips */}
            <div className="p-3 bg-mono-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-mono-600 mt-0.5" />
                <div>
                  <p className="text-sm text-mono-700">
                    <strong>Pro Tip:</strong> The AI analyzes your description to create personalized 
                    evaluation criteria that match your specific goals and preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Predefined step sets for different operations
export const LOADING_STEPS = {
  generateContent: [
    {
      id: "analyze",
      label: "Analyzing Description",
      description: "Understanding your vision and requirements",
      icon: <Brain className="w-5 h-5" />,
      estimatedDuration: 3
    },
    {
      id: "criteria",
      label: "Generating Criteria",
      description: "Creating custom evaluation framework",
      icon: <Target className="w-5 h-5" />,
      estimatedDuration: 5
    },
    {
      id: "prompts",
      label: "Optimizing Prompts",
      description: "Crafting AI-optimized image generation prompts",
      icon: <Sparkles className="w-5 h-5" />,
      estimatedDuration: 4
    }
  ],
  generateImages: [
    {
      id: "queue",
      label: "Joining Queue",
      description: "Getting in line for image generation",
      icon: <Loader2 className="w-5 h-5" />,
      estimatedDuration: 2
    },
    {
      id: "generate",
      label: "Generating Images",
      description: "AI is creating your images",
      icon: <Image className="w-5 h-5" />,
      estimatedDuration: 15
    },
    {
      id: "process",
      label: "Processing Results",
      description: "Finalizing and optimizing images",
      icon: <Sparkles className="w-5 h-5" />,
      estimatedDuration: 3
    }
  ],
  evaluation: [
    {
      id: "analyze",
      label: "Analyzing Images",
      description: "AI is examining your generated images",
      icon: <Brain className="w-5 h-5" />,
      estimatedDuration: 4
    },
    {
      id: "score",
      label: "Scoring Prompts",
      description: "Evaluating against your criteria",
      icon: <Target className="w-5 h-5" />,
      estimatedDuration: 6
    },
    {
      id: "recommendations",
      label: "Generating Insights",
      description: "Creating improvement recommendations",
      icon: <Sparkles className="w-5 h-5" />,
      estimatedDuration: 4
    }
  ]
}