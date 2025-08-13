import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json({ valid: false, error: "OPENAI_API_KEY is not set on the server" }, { status: 400 })
    }

    const model = openai("gpt-5-nano", { apiKey })

    await generateText({
      model,
      prompt: "healthcheck",
      maxTokens: 1,
    })

    return NextResponse.json({ valid: true, message: "Server OPENAI_API_KEY works with GPT-5" })
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error?.message || String(error) }, { status: 500 })
  }
}