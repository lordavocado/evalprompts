"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, Zap, TrendingUp, Sparkles, MessageCircle } from "lucide-react"

interface ProductExplainerProps {
  onGetStarted: () => void
}

export function ProductExplainer({ onGetStarted }: ProductExplainerProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-mono-900 mb-4">EvalPrompts</h1>
          </div>
          <p className="text-xl text-mono-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform your creative ideas into high-performing AI image generation prompts through systematic evaluation and optimization.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-mono-900 hover:bg-mono-800 text-white text-lg px-12 py-4 h-auto rounded-lg font-medium"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-mono-900 mb-16">How it works</h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-mono-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-mono-900">Describe</h3>
                <p className="text-mono-600 leading-relaxed">Tell us what you want to create</p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-mono-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-mono-900">Generate</h3>
                <p className="text-mono-600 leading-relaxed">AI creates custom criteria & optimized prompts</p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-mono-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-mono-900">Improve</h3>
                <p className="text-mono-600 leading-relaxed">Evaluate & refine automatically</p>
              </div>
            </div>

            {/* Simple tagline */}
            <div className="text-center mt-16">
              <div className="inline-block border border-mono-200 px-8 py-4 rounded-lg">
                <span className="text-lg font-medium text-mono-800">Better prompts, better results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center border-mono-200 shadow-none">
            <CardHeader>
              <div className="w-12 h-12 bg-mono-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-mono-900">AI-Powered Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-mono-600 leading-relaxed">
                Generates personalized evaluation criteria and optimized prompts tailored to your specific use case.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-mono-200 shadow-none">
            <CardHeader>
              <div className="w-12 h-12 bg-mono-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-mono-900">Precision Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-mono-600 leading-relaxed">
                Advanced framework that scores prompts across multiple dimensions including quality, adherence, and aesthetics.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-mono-200 shadow-none">
            <CardHeader>
              <div className="w-12 h-12 bg-mono-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-mono-900">Iterative Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-mono-600 leading-relaxed">
                Continuous refinement that learns from results to progressively improve prompt effectiveness.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-mono-900 mb-12">Perfect for</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Digital Artists", desc: "Create stunning artwork with optimized creative prompts" },
              { title: "Marketers", desc: "Generate compelling visuals for campaigns and branding" },
              { title: "Businesses", desc: "Produce professional product photography and content" },
              { title: "Game Developers", desc: "Design characters, environments, and concept art" },
            ].map((useCase, index) => (
              <Card key={index} className="text-center border-mono-200 shadow-none hover:border-mono-300 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg text-mono-900">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-mono-600 leading-relaxed">{useCase.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-mono-900 rounded-xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 text-mono-200">
            Transform your creative ideas into high-performing prompts.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-mono-900 hover:bg-mono-100 text-lg px-8 py-4 h-auto rounded-lg font-medium"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-mono-200">
          <p className="text-mono-600 mb-4">
            Made with <span className="text-mono-900">♥</span> by Nichlas Campos
          </p>
          <p className="text-mono-500 text-sm mb-6">Feel free to connect on LinkedIn or X</p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.linkedin.com/in/nichlaskvist/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mono-600 hover:text-mono-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://x.com/nkjorg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mono-600 hover:text-mono-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
