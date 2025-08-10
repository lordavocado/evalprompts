import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      )
    }

    // Validate OpenAI API key format
    if (apiKey.length < 10 || !/^[!-~]+$/.test(apiKey)) {
      return NextResponse.json(
        { error: 'Invalid OpenAI key format' },
        { status: 400 }
      )
    }

    // Test the API key with a minimal request
    try {
      const oai = createOpenAI({ apiKey: apiKey.trim() })
      const model = oai("gpt-5-nano" as any)

      await generateText({
        model,
        prompt: "Test",
        maxTokens: 1,
      })

      return NextResponse.json({ 
        valid: true, 
        message: "API key is valid" 
      })
    } catch (apiError: any) {
      console.error("OpenAI API validation error:", apiError)
      
      // Parse specific OpenAI errors
      let errorMessage = "Invalid API key"
      if (apiError.message?.includes("Incorrect API key")) {
        errorMessage = "Invalid API key - please check your key"
      } else if (apiError.message?.includes("quota")) {
        errorMessage = "API key valid but quota exceeded"
      } else if (apiError.message?.includes("rate limit")) {
        errorMessage = "API key valid but rate limited"
      }

      return NextResponse.json(
        { 
          valid: false, 
          error: errorMessage 
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Validation endpoint error:", error)
    return NextResponse.json(
      { error: "Internal server error during validation" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed - use POST" },
    { status: 405 }
  )
}