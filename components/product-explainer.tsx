"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, Zap, TrendingUp, Sparkles, MessageCircle } from "lucide-react"

interface ProductExplainerProps {
  onGetStarted: () => void
}

export function ProductExplainer({ onGetStarted }: ProductExplainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-8 h-8 text-purple-600" />
            <h1 className="text-5xl font-bold text-gray-900">EvalPrompts</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            The intelligent AI prompt evaluation platform that transforms your creative ideas into optimized,
            high-performing image generation prompts through systematic analysis and iterative improvement.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-3"
          >
            Start Optimizing Your Prompts
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How EvalPrompts Works</h2>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              {/* Step 1 */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Describe</h3>
                <p className="text-gray-600">Tell us what you want to create</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center flex-shrink-0 mt-10">
                <ArrowRight className="w-8 h-8 text-purple-400" />
              </div>

              {/* Step 2 */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. AI Generates</h3>
                <p className="text-gray-600">Custom criteria & 3 optimized prompts</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center flex-shrink-0 mt-10">
                <ArrowRight className="w-8 h-8 text-blue-400" />
              </div>

              {/* Step 3 */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Improve</h3>
                <p className="text-gray-600">Evaluate & refine automatically</p>
              </div>
            </div>

            {/* Simple tagline */}
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-8 py-4 rounded-full">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-semibold text-gray-800">Better Prompts, Better Results</span>
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle>AI-Powered Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI analyzes your creative vision and generates personalized evaluation criteria and optimized
                prompts tailored to your specific use case.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Precision Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced evaluation framework that scores prompts across multiple dimensions including quality,
                adherence, aesthetics, and use-case specific criteria.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>Iterative Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Continuous refinement process that learns from evaluation results to progressively improve prompt
                effectiveness and image quality.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎨", title: "Digital Artists", desc: "Create stunning artwork with optimized creative prompts" },
              { icon: "💼", title: "Marketers", desc: "Generate compelling visuals for campaigns and branding" },
              { icon: "🏢", title: "Businesses", desc: "Produce professional product photography and content" },
              { icon: "🎮", title: "Game Developers", desc: "Design characters, environments, and concept art" },
            ].map((useCase, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{useCase.icon}</div>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{useCase.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Prompts?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who are already using EvalPrompts to generate better images faster.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            variant="secondary"
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200 bg-white/50">
          <p className="text-gray-600 mb-4">
            Made with <span className="text-red-500">♥</span> by Nichlas Campos
          </p>
          <p className="text-gray-500 text-sm mb-4">Feel free to connect on LinkedIn or X</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/nichlaskvist/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://x.com/nkjorg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
