"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface ProgressStep {
  id: string
  label: string
  description?: string
  status: "pending" | "in-progress" | "completed" | "error"
  progress?: number
}

interface ProgressIndicatorProps {
  title: string
  steps: ProgressStep[]
  currentStep?: string
  onCancel?: () => void
  className?: string
}

export function ProgressIndicator({ 
  title, 
  steps, 
  currentStep, 
  onCancel, 
  className = "" 
}: ProgressIndicatorProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0)

  // Calculate overall progress
  const completedSteps = steps.filter(step => step.status === "completed").length
  const totalSteps = steps.length
  const overallProgress = (completedSteps / totalSteps) * 100

  // Find current step details
  const activeStep = steps.find(step => step.status === "in-progress" || step.id === currentStep)

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = activeStep?.progress || overallProgress
    const interval = setInterval(() => {
      setDisplayedProgress(prev => {
        const diff = targetProgress - prev
        if (Math.abs(diff) < 1) {
          clearInterval(interval)
          return targetProgress
        }
        return prev + diff * 0.1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [overallProgress, activeStep?.progress])

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-mono-700" />
      case "in-progress":
        return <Loader2 className="w-4 h-4 text-mono-700 animate-spin" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-mono-500" />
      default:
        return <div className="w-4 h-4 rounded-full bg-mono-300" />
    }
  }

  const getStepTextColor = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return "text-mono-800 font-medium"
      case "in-progress":
        return "text-mono-900 font-semibold"
      case "error":
        return "text-mono-600"
      default:
        return "text-mono-500"
    }
  }

  return (
    <Card className={`border-mono-200 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-mono-900">{title}</h3>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-sm text-mono-500 hover:text-mono-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mono-600">Overall Progress</span>
              <span className="text-mono-900 font-medium">
                {Math.round(displayedProgress)}%
              </span>
            </div>
            <Progress value={displayedProgress} className="h-2" />
          </div>

          {/* Current Step Details */}
          {activeStep && (
            <div className="p-3 bg-mono-50 rounded-lg border border-mono-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-mono-700 animate-spin" />
                <span className="font-medium text-mono-900">{activeStep.label}</span>
              </div>
              {activeStep.description && (
                <p className="text-sm text-mono-700 mt-1 ml-6">
                  {activeStep.description}
                </p>
              )}
              {activeStep.progress !== undefined && (
                <div className="mt-2 ml-6">
                  <Progress value={activeStep.progress} className="h-1" />
                </div>
              )}
            </div>
          )}

          {/* Steps List */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded transition-colors ${
                  step.status === "in-progress" ? "bg-mono-50" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${getStepTextColor(step)}`}>
                    {step.label}
                  </div>
                  {step.description && step.status === "in-progress" && (
                    <div className="text-xs text-mono-500 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-mono-400">
                  {index + 1}/{totalSteps}
                </div>
              </div>
            ))}
          </div>

          {/* Error Summary */}
          {steps.some(step => step.status === "error") && (
            <div className="p-3 bg-mono-100 rounded-lg border border-mono-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-mono-600" />
                <span className="font-medium text-mono-900">Some steps failed</span>
              </div>
              <p className="text-sm text-mono-700 mt-1">
                Check the steps above for details. You can retry or continue with available results.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper hook for managing progress steps
export function useProgressSteps(initialSteps: Omit<ProgressStep, "status">[]) {
  const [steps, setSteps] = useState<ProgressStep[]>(
    initialSteps.map(step => ({ ...step, status: "pending" as const }))
  )

  const updateStep = (id: string, updates: Partial<ProgressStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ))
  }

  const startStep = (id: string, description?: string) => {
    updateStep(id, { status: "in-progress", description, progress: 0 })
  }

  const updateStepProgress = (id: string, progress: number, description?: string) => {
    updateStep(id, { progress, description })
  }

  const completeStep = (id: string) => {
    updateStep(id, { status: "completed", progress: 100 })
  }

  const errorStep = (id: string, description?: string) => {
    updateStep(id, { status: "error", description })
  }

  const resetSteps = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: "pending" as const, progress: 0 })))
  }

  return {
    steps,
    updateStep,
    startStep,
    updateStepProgress,
    completeStep,
    errorStep,
    resetSteps
  }
}