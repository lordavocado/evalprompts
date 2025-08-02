"use client"

import { useState, useCallback, useRef } from "react"

interface PromptData {
  id: string
  text: string
  imageUrl?: string
  scores?: Record<string, number> & { overall: number }
  feedback?: string
  suggestions?: string[]
  iteration: number
}

interface HistoryEntry {
  id: string
  timestamp: number
  prompts: PromptData[]
  action: string
  description: string
}

export function usePromptHistory(initialPrompts: PromptData[] = []) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [prompts, setPrompts] = useState<PromptData[]>(initialPrompts)
  const actionIdRef = useRef(0)

  // Add a new entry to history
  const addToHistory = useCallback((
    newPrompts: PromptData[], 
    action: string, 
    description: string
  ) => {
    const entry: HistoryEntry = {
      id: `action_${++actionIdRef.current}`,
      timestamp: Date.now(),
      prompts: JSON.parse(JSON.stringify(newPrompts)), // Deep clone
      action,
      description
    }

    setHistory(prev => {
      // Remove any entries after current index (for when we undo then make new changes)
      const newHistory = prev.slice(0, currentIndex + 1)
      return [...newHistory, entry]
    })

    setCurrentIndex(prev => prev + 1)
    setPrompts(newPrompts)
  }, [currentIndex])

  // Update prompts and add to history
  const updatePrompts = useCallback((
    newPrompts: PromptData[], 
    action: string, 
    description: string
  ) => {
    addToHistory(newPrompts, action, description)
  }, [addToHistory])

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      const prevEntry = history[prevIndex]
      setCurrentIndex(prevIndex)
      setPrompts(prevEntry.prompts)
      return prevEntry
    }
    return null
  }, [currentIndex, history])

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1
      const nextEntry = history[nextIndex]
      setCurrentIndex(nextIndex)
      setPrompts(nextEntry.prompts)
      return nextEntry
    }
    return null
  }, [currentIndex, history])

  // Check if undo/redo is available
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  // Get current entry info
  const currentEntry = currentIndex >= 0 ? history[currentIndex] : null

  // Get history summary for UI
  const getHistorySummary = useCallback(() => {
    return history.map((entry, index) => ({
      ...entry,
      isCurrent: index === currentIndex,
      canNavigateTo: true
    }))
  }, [history, currentIndex])

  // Navigate to specific history entry
  const navigateToEntry = useCallback((entryId: string) => {
    const entryIndex = history.findIndex(entry => entry.id === entryId)
    if (entryIndex >= 0) {
      setCurrentIndex(entryIndex)
      setPrompts(history[entryIndex].prompts)
      return history[entryIndex]
    }
    return null
  }, [history])

  // Clear history (useful for starting fresh)
  const clearHistory = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
  }, [])

  // Initialize with first entry if prompts exist
  const initialize = useCallback((initialPrompts: PromptData[], description = "Initial prompts") => {
    if (initialPrompts.length > 0 && history.length === 0) {
      addToHistory(initialPrompts, "initialize", description)
    }
  }, [addToHistory, history.length])

  return {
    prompts,
    updatePrompts,
    undo,
    redo,
    canUndo,
    canRedo,
    currentEntry,
    history: getHistorySummary(),
    navigateToEntry,
    clearHistory,
    initialize,
    // Convenience methods for common operations
    setPrompts: (newPrompts: PromptData[]) => updatePrompts(newPrompts, "manual", "Manual prompt update"),
    addImageGeneration: (newPrompts: PromptData[]) => updatePrompts(newPrompts, "generate", "Generated images"),
    addEvaluation: (newPrompts: PromptData[]) => updatePrompts(newPrompts, "evaluate", "AI evaluation completed"),
    addImprovement: (newPrompts: PromptData[], improvementType?: string) => 
      updatePrompts(newPrompts, "improve", `Applied ${improvementType || "improvements"}`),
    addCustomDirection: (newPrompts: PromptData[], direction: string) => 
      updatePrompts(newPrompts, "custom", `Applied custom direction: ${direction.slice(0, 50)}...`),
  }
}

// Helper to compare prompts for changes
export function hasPromptsChanged(oldPrompts: PromptData[], newPrompts: PromptData[]): boolean {
  if (oldPrompts.length !== newPrompts.length) return true
  
  return oldPrompts.some((oldPrompt, index) => {
    const newPrompt = newPrompts[index]
    return oldPrompt.text !== newPrompt.text ||
           oldPrompt.imageUrl !== newPrompt.imageUrl ||
           JSON.stringify(oldPrompt.scores) !== JSON.stringify(newPrompt.scores)
  })
}