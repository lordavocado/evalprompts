"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, Shield, CheckCircle } from "lucide-react"

interface ApiKeySetupProps {
  onComplete: (keys: { openaiKey?: string; falKey?: string }) => void
  existingKeys?: { openaiKey?: string; falKey?: string }
}

// Simplified flow: no inline validation state

export function ApiKeySetup({ onComplete, existingKeys }: ApiKeySetupProps) {
  const [openaiKey, setOpenaiKey] = useState(existingKeys?.openaiKey || "")
  const [falKey, setFalKey] = useState(existingKeys?.falKey || "")
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showFalKey, setShowFalKey] = useState(false)
  // No separate validate-and-continue flow

  const handleContinue = () => {
    const trimmedOpenai = openaiKey.trim()
    const trimmedFal = falKey.trim()
    if (!trimmedOpenai || !trimmedFal) return
    const keys = {
      openaiKey: trimmedOpenai,
      falKey: trimmedFal,
    }
    onComplete(keys)
  }

  // Removed inline status indicator icons for a cleaner UI

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Key className="w-6 h-6" />
            API Keys (required)
          </CardTitle>
          <CardDescription>Enter your OpenAI and Fal AI keys to use the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-mono-50 border-mono-200">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy:</strong> Keys stay in your browser. We never store or see them.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="flex items-center gap-2">
                <span>OpenAI (evaluation)</span>
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="Enter your OpenAI key..."
                  className="pr-12"
                />
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 px-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  >
                    {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-mono-600">
                Get your key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  className="text-mono-700 hover:underline font-medium"
                  rel="noreferrer"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fal-key" className="flex items-center gap-2">
                <span>Fal AI (images)</span>
              </Label>
              <div className="relative">
                <Input
                  id="fal-key"
                  type={showFalKey ? "text" : "password"}
                  value={falKey}
                  onChange={(e) => setFalKey(e.target.value)}
                  placeholder="Enter your Fal AI key..."
                  className="pr-12"
                />
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 px-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={() => setShowFalKey(!showFalKey)}
                  >
                    {showFalKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-mono-600">
                Get your key from{" "}
                <a
                  href="https://fal.ai/dashboard"
                  target="_blank"
                  className="text-mono-700 hover:underline font-medium"
                  rel="noreferrer"
                >
                  Fal AI Dashboard
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleContinue} 
              size="lg" 
              className="w-full"
              disabled={!openaiKey.trim() || !falKey.trim()}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
