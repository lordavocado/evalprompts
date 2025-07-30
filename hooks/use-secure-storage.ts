"use client"

import { useState, useEffect } from "react"

// Simple encryption for client-side storage (not cryptographically secure, but better than plain text)
const encode = (str: string): string => {
  return btoa(encodeURIComponent(str))
}

const decode = (str: string): string => {
  try {
    return decodeURIComponent(atob(str))
  } catch {
    return ""
  }
}

interface ApiKeys {
  openaiKey?: string
  falKey?: string
}

export function useSecureStorage() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({})

  useEffect(() => {
    // Load API keys from localStorage on mount
    try {
      const stored = localStorage.getItem("ai-evaluator-keys")
      if (stored) {
        const decoded = decode(stored)
        const parsed = JSON.parse(decoded)
        setApiKeys(parsed)
      }
    } catch (error) {
      console.error("Error loading API keys:", error)
    }
  }, [])

  const saveApiKeys = (keys: ApiKeys) => {
    try {
      const encoded = encode(JSON.stringify(keys))
      localStorage.setItem("ai-evaluator-keys", encoded)
      setApiKeys(keys)
    } catch (error) {
      console.error("Error saving API keys:", error)
    }
  }

  const clearApiKeys = () => {
    try {
      localStorage.removeItem("ai-evaluator-keys")
      setApiKeys({})
    } catch (error) {
      console.error("Error clearing API keys:", error)
    }
  }

  return {
    apiKeys,
    saveApiKeys,
    clearApiKeys,
  }
}
