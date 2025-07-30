"use client"

import { useState, useEffect } from "react"
import type { EvaluationCriteria } from "@/types/evaluation-criteria"

const STORAGE_KEY = "custom-evaluation-criteria"

export function useCustomCriteria() {
  const [customCriteria, setCustomCriteria] = useState<EvaluationCriteria[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setCustomCriteria(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Error loading custom criteria:", error)
    }
  }, [])

  // Save to localStorage whenever customCriteria changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCriteria))
    } catch (error) {
      console.error("Error saving custom criteria:", error)
    }
  }, [customCriteria])

  const addCustomCriteria = (criteria: EvaluationCriteria) => {
    setCustomCriteria((prev) => {
      const existing = prev.find((c) => c.id === criteria.id)
      if (existing) {
        // Update existing
        return prev.map((c) => (c.id === criteria.id ? criteria : c))
      } else {
        // Add new
        return [...prev, criteria]
      }
    })
  }

  const removeCustomCriteria = (id: string) => {
    setCustomCriteria((prev) => prev.filter((c) => c.id !== id))
  }

  const updateCustomCriteria = (criteria: EvaluationCriteria) => {
    setCustomCriteria((prev) => prev.map((c) => (c.id === criteria.id ? criteria : c)))
  }

  return {
    customCriteria,
    addCustomCriteria,
    removeCustomCriteria,
    updateCustomCriteria,
  }
}
