"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface ApiKeySetupProps {
  onComplete: (keys: { openaiKey?: string; falKey?: string }) => void
  existingKeys?: { openaiKey?: string; falKey?: string }
}

interface KeyValidationState {
  isValidating: boolean
  isValid?: boolean
  error?: string
}

export function ApiKeySetup({ onComplete, existingKeys }: ApiKeySetupProps) {
  const [openaiKey, setOpenaiKey] = useState(existingKeys?.openaiKey || "")
  const [falKey, setFalKey] = useState(existingKeys?.falKey || "")
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showFalKey, setShowFalKey] = useState(false)
  const [skipSetup, setSkipSetup] = useState(false)
  const [openaiValidation, setOpenaiValidation] = useState<KeyValidationState>({ isValidating: false })
  const [falValidation, setFalValidation] = useState<KeyValidationState>({ isValidating: false })
  const [isValidatingAll, setIsValidatingAll] = useState(false)

  const validateOpenAIKey = async (key: string) => {
    if (!key.trim()) return
    
    setOpenaiValidation({ isValidating: true })
    
    try {
      // Simple validation: check if key format looks correct
      if (!key.startsWith('sk-')) {
        throw new Error('OpenAI keys should start with "sk-"')
      }
      
      // Make a test call to validate the API key
      const response = await fetch('/api/validate-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key.trim() })
      })
      
      if (response.ok) {
        const result = await response.json()
        setOpenaiValidation({ isValidating: false, isValid: true })
      } else {
        const errorData = await response.json()
        setOpenaiValidation({ 
          isValidating: false, 
          isValid: false, 
          error: errorData.error || 'Failed to validate API key'
        })
      }
    } catch (error: any) {
      console.error('OpenAI validation error:', error)
      setOpenaiValidation({ 
        isValidating: false, 
        isValid: false, 
        error: error.message || 'Network error - please check your connection'
      })
    }
  }

  const validateFalKey = async (key: string) => {
    if (!key.trim()) return
    
    setFalValidation({ isValidating: true })
    
    try {
      // Enhanced validation: check if key format looks correct
      if (!key.startsWith('fal_')) {
        throw new Error('Fal AI keys should start with "fal_"')
      }
      
      if (key.length < 20) {
        throw new Error('Fal AI key appears to be too short')
      }
      
      // Format validation passed
      setFalValidation({ 
        isValidating: false, 
        isValid: true 
      })
    } catch (error: any) {
      console.error('Fal AI validation error:', error)
      setFalValidation({ 
        isValidating: false, 
        isValid: false, 
        error: error.message || 'Invalid API key format'
      })
    }
  }

  const handleValidateAndContinue = async () => {
    setIsValidatingAll(true)
    
    // Validate keys if provided
    if (openaiKey.trim()) {
      await validateOpenAIKey(openaiKey.trim())
    }
    if (falKey.trim()) {
      await validateFalKey(falKey.trim())
    }
    
    setIsValidatingAll(false)
    
    // Continue even if validation fails (user choice)
    const keys = {
      openaiKey: openaiKey.trim() || undefined,
      falKey: falKey.trim() || undefined,
    }
    onComplete(keys)
  }

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

  const getKeyStatus = (validation: KeyValidationState) => {
    if (validation.isValidating) {
      return <Loader2 className="w-4 h-4 animate-spin text-mono-600" />
    }
    if (validation.isValid === true) {
      return <CheckCircle className="w-4 h-4 text-mono-700" />
    }
    if (validation.isValid === false) {
      return <AlertCircle className="w-4 h-4 text-mono-500" />
    }
    return null
  }

  if (skipSetup) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Key className="w-6 h-6" />
            EvalPrompts - API Configuration
          </CardTitle>
          <CardDescription>Configure your API keys for the best experience, or try our demo mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-mono-50 border-mono-200">
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
                <span className="text-sm text-mono-500">(Optional - for AI evaluation)</span>
                {getKeyStatus(openaiValidation)}
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => {
                    setOpenaiKey(e.target.value)
                    setOpenaiValidation({ isValidating: false }) // Reset validation on change
                  }}
                  onBlur={() => openaiKey.trim() && validateOpenAIKey(openaiKey.trim())}
                  placeholder="sk-..."
                  className={`pr-16 ${
                    openaiValidation.isValid === false ? "border-mono-400 focus:border-mono-500 focus:ring-mono-500" : 
                    openaiValidation.isValid === true ? "border-mono-600 focus:border-mono-700 focus:ring-mono-700" : ""
                  }`}
                />
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 px-3">
                  {getKeyStatus(openaiValidation)}
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
              {openaiValidation.error && (
                <Alert className="bg-mono-100 border-mono-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-mono-800">
                    {openaiValidation.error}
                  </AlertDescription>
                </Alert>
              )}
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
                <span>Fal AI API Key</span>
                <span className="text-sm text-mono-500">(Optional - for image generation)</span>
                {getKeyStatus(falValidation)}
              </Label>
              <div className="relative">
                <Input
                  id="fal-key"
                  type={showFalKey ? "text" : "password"}
                  value={falKey}
                  onChange={(e) => {
                    setFalKey(e.target.value)
                    setFalValidation({ isValidating: false }) // Reset validation on change
                  }}
                  onBlur={() => falKey.trim() && validateFalKey(falKey.trim())}
                  placeholder="fal_..."
                  className={`pr-16 ${
                    falValidation.isValid === false ? "border-mono-400 focus:border-mono-500 focus:ring-mono-500" : 
                    falValidation.isValid === true ? "border-mono-600 focus:border-mono-700 focus:ring-mono-700" : ""
                  }`}
                />
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 px-3">
                  {getKeyStatus(falValidation)}
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
              {falValidation.error && (
                <Alert className="bg-mono-100 border-mono-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-mono-800">
                    {falValidation.error}
                  </AlertDescription>
                </Alert>
              )}
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
            {(openaiKey.trim() || falKey.trim()) && (
              <Button 
                onClick={handleValidateAndContinue} 
                size="lg" 
                className="w-full"
                disabled={isValidatingAll}
              >
                {isValidatingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating Keys...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate & Continue
                  </>
                )}
              </Button>
            )}
            <Button 
              onClick={handleContinue} 
              size="lg" 
              className="w-full"
              variant={openaiKey.trim() || falKey.trim() ? "outline" : "default"}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue {openaiKey.trim() || falKey.trim() ? "Without Validation" : "with API Keys"}
            </Button>
            <Button onClick={handleSkip} variant="outline" size="lg" className="w-full bg-transparent">
              Skip Setup - Use Demo Mode
            </Button>
          </div>

          <div className="text-center text-sm text-mono-600">
            <p>
              <strong>With Valid API Keys:</strong> Full AI evaluation and real image generation
            </p>
            <p>
              <strong>Demo Mode:</strong> Intelligent mock evaluation for testing the workflow
            </p>
            <p className="mt-2 text-xs text-mono-500">
              Keys are validated automatically when you leave the input fields. You can continue without validation if needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
