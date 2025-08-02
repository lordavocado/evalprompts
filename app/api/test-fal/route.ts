import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, endpoint } = await request.json()
    
    if (!apiKey || !endpoint) {
      return NextResponse.json(
        { error: "API key and endpoint are required" },
        { status: 400 }
      )
    }

    // Validate Fal AI key format
    if (apiKey.length < 10 || !/^[!-~]+$/.test(apiKey)) {
      return NextResponse.json(
        { error: 'Invalid Fal AI key format' },
        { status: 400 }
      )
    }

    console.log(`Testing Fal.ai endpoint: ${endpoint}`)

    try {
      // Dynamically import Fal to avoid build issues
      const fal = await import("@fal-ai/serverless-client")

      // Configure with user-provided key
      fal.config({
        credentials: apiKey.trim(),
      })

      // Test with a simple prompt
      const testParameters = {
        prompt: "A simple test image",
        aspect_ratio: "1:1",
        num_inference_steps: 20,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: "jpeg",
      }

      console.log("Testing with parameters:", testParameters)

      const result = await fal.subscribe(endpoint, {
        input: testParameters,
        logs: true,
        pollInterval: 1000,
        timeout: 30000, // 30 second timeout for testing
      })

      console.log("Test result:", result)

      if (result && result.images && result.images.length > 0) {
        return NextResponse.json({ 
          valid: true, 
          message: "Endpoint working correctly",
          imageUrl: result.images[0].url,
          endpoint: endpoint
        })
      } else {
        return NextResponse.json({
          valid: false,
          error: "No images returned from endpoint",
          result: result
        }, { status: 400 })
      }

    } catch (apiError: any) {
      console.error("Fal AI test error:", apiError)
      
      // Parse specific Fal AI errors
      let errorMessage = "Unknown API error"
      if (apiError.message?.includes("Authentication")) {
        errorMessage = "Invalid API key - authentication failed"
      } else if (apiError.message?.includes("quota")) {
        errorMessage = "API quota exceeded"
      } else if (apiError.message?.includes("rate limit")) {
        errorMessage = "Rate limit exceeded"
      } else if (apiError.message?.includes("not found") || apiError.status === 404) {
        errorMessage = `Endpoint '${endpoint}' not found - may be invalid or deprecated`
      } else if (apiError.message?.includes("timeout")) {
        errorMessage = "Request timeout - endpoint may be overloaded"
      } else {
        errorMessage = apiError.message || "API request failed"
      }

      return NextResponse.json({
        valid: false,
        error: errorMessage,
        endpoint: endpoint,
        statusCode: apiError.status,
        details: apiError.message
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error("Test endpoint error:", error)
    return NextResponse.json(
      { error: "Internal server error during testing" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: "Fal.ai endpoint testing utility",
      usage: "POST with { apiKey, endpoint } to test an endpoint"
    },
    { status: 200 }
  )
}