"use client"

import { useState, useEffect } from "react"

interface UsageStats {
  falRequests: number
  openaiRequests: number
  totalCost: number
  lastUpdated: number
  requestHistory: {
    timestamp: number
    service: "fal" | "openai"
    cost: number
    type: string
  }[]
}

const STORAGE_KEY = "evalprompts-usage-stats"

// Pricing (approximate, for local estimates only; may differ from provider billing)
const PRICING = {
  fal: {
    "flux-pro": 0.055, // per image
    "flux-dev": 0.025,
    "flux-schnell": 0.003,
    "flux-realism": 0.055,
    "flux-anime": 0.025,
  },
  openai: {
    "gpt-5-mini": 0.00015, // per 1K tokens (input)
    "gpt-5-nano": 0.00005, // per 1K tokens (input)
  },
}

export function useUsageTracking() {
  const [stats, setStats] = useState<UsageStats>({
    falRequests: 0,
    openaiRequests: 0,
    totalCost: 0,
    lastUpdated: Date.now(),
    requestHistory: [],
  })

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setStats(parsed)
      }
    } catch (error) {
      console.error("Error loading usage stats:", error)
    }
  }, [])

  // Save to localStorage whenever stats change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch (error) {
      console.error("Error saving usage stats:", error)
    }
  }, [stats])

  const trackFalRequest = (modelId: string, imageCount = 1) => {
    const modelKey = modelId.replace("fal-ai/", "").replace("/", "-") as keyof typeof PRICING.fal
    const costPerImage = PRICING.fal[modelKey] || PRICING.fal["flux-dev"]
    const totalCost = costPerImage * imageCount

    setStats((prev) => ({
      ...prev,
      falRequests: prev.falRequests + imageCount,
      totalCost: prev.totalCost + totalCost,
      lastUpdated: Date.now(),
      requestHistory: [
        ...prev.requestHistory,
        {
          timestamp: Date.now(),
          service: "fal",
          cost: totalCost,
          type: `${modelKey} (${imageCount} image${imageCount > 1 ? "s" : ""})`,
        },
      ].slice(-100), // Keep last 100 requests
    }))
  }

  const trackOpenAIRequest = (model: string, estimatedTokens = 1000) => {
    const key = model.includes("nano") ? "gpt-5-nano" : "gpt-5-mini"
    const costPer1K = (PRICING.openai as any)[key] || (PRICING.openai as any)["gpt-5-mini"]
    const totalCost = (estimatedTokens / 1000) * costPer1K

    setStats((prev) => ({
      ...prev,
      openaiRequests: prev.openaiRequests + 1,
      totalCost: prev.totalCost + totalCost,
      lastUpdated: Date.now(),
      requestHistory: [
        ...prev.requestHistory,
        {
          timestamp: Date.now(),
          service: "openai",
          cost: totalCost,
          type: `${key} (~${estimatedTokens} tokens)`,
        },
      ].slice(-100),
    }))
  }

  const resetStats = () => {
    setStats({
      falRequests: 0,
      openaiRequests: 0,
      totalCost: 0,
      lastUpdated: Date.now(),
      requestHistory: [],
    })
  }

  const getRecentRequests = (limit = 10) => {
    return stats.requestHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  }

  return {
    stats,
    trackFalRequest,
    trackOpenAIRequest,
    resetStats,
    getRecentRequests,
  }
}
