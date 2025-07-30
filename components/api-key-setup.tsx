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

export function ApiKeySetup({ onComplete, existingKeys }: ApiKeySetupProps) {
  const [openaiKey, setOpenaiKey] = useState(existingKeys?.openaiKey || "")
  const [falKey, setFalKey] = useState(existingKeys?.falKey || "")
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showFalKey, setShowFalKey] = useState(false)
  const [skipSetup, setSkipSetup] = useState(false)

  const handleContinue = () => {
    const keys = {
      openaiKey: openaiKey.trim() || undefined,
      falKey: falKey.trim() || undefined,
    }
    onComplete(keys)
  }

  const handleSkip = () => {
    setSkipSetup(true)
    onComplete({})
  }

  if (skipSetup) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Key className="w-6 h-6" />
            EvalPrompts - API Configuration
          </CardTitle>
          <CardDescription>Configure your API keys for the best experience, or try our demo mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy First:</strong> Your API keys are stored securely in your browser and never sent to our
              servers. They're only used to make direct API calls from your browser.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="flex items-center gap-2">
                <span>OpenAI API Key</span>
                <span className="text-sm text-gray-500">(Optional - for AI evaluation)</span>
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                >
                  {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Get your key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                  rel="noreferrer"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fal-key" className="flex items-center gap-2">
                <span>Fal AI API Key</span>
                <span className="text-sm text-gray-500">(Optional - for image generation)</span>
              </Label>
              <div className="relative">
                <Input
                  id="fal-key"
                  type={showFalKey ? "text" : "password"}
                  value={falKey}
                  onChange={(e) => setFalKey(e.target.value)}
                  placeholder="fal_..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowFalKey(!showFalKey)}
                >
                  {showFalKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Get your key from{" "}
                <a
                  href="https://fal.ai/dashboard"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                  rel="noreferrer"
                >
                  Fal AI Dashboard
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleContinue} size="lg" className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue with API Keys
            </Button>
            <Button onClick={handleSkip} variant="outline" size="lg" className="w-full bg-transparent">
              Skip Setup - Use Demo Mode
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              <strong>With API Keys:</strong> Full AI evaluation and real image generation
            </p>
            <p>
              <strong>Demo Mode:</strong> Intelligent mock evaluation for testing the workflow
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
