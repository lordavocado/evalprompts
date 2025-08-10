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
        <div className="relative text-center mb-16 overflow-hidden rounded-2xl">
          <div className="absolute -top-24 -left-24 h-72 w-72 bg-indigo-300 rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 bg-fuchsia-300 rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="relative py-8">
            <div className="mb-6">
              <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Make your prompts pop ✨
              </h1>
            </div>
            <p className="text-xl text-mono-700 max-w-3xl mx-auto mb-6 leading-relaxed">
              Tell us what you want to create. We’ll craft, score, and refine prompts until they shine — all in a clean, simple UI.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:brightness-110 text-white text-lg px-12 py-4 h-auto rounded-lg font-medium shadow-sm"
              >
                Try it now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="mt-3 text-sm text-mono-500">
              No sign-up • Your API keys stay on your device
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mb-20">
          <h2 className="text-3xl font-bold text-center text-mono-900 mb-6">How it works</h2>
          <p className="text-center text-mono-600 mb-10">A friendly loop that turns vague ideas into crisp prompts.</p>

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
              <div className="inline-flex items-center gap-2 border border-mono-200 px-6 py-3 rounded-full bg-white/70 backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-mono-800">People get results in minutes, not hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Testimonials Row */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[{
              quote: "I shipped a moodboard in one afternoon.",
              author: "Lina, Art Director"
            },{
              quote: "It feels like pair-programming, but for visuals.",
              author: "Devin, Indie Dev"
            },{
              quote: "Our ads look better and took half the time.",
              author: "Sam, Growth Marketer"
            }].map((t, i) => (
              <div key={i} className="p-5 rounded-xl border border-mono-200 bg-white/70">
                <p className="text-mono-800">“{t.quote}”</p>
                <p className="text-sm text-mono-500 mt-2">{t.author}</p>
              </div>
            ))}
          </div>
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
        <div className="relative text-center rounded-2xl p-12 mb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-90" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-3 text-white">Launch something beautiful today</h2>
            <p className="text-lg mb-6 text-white/80">
              Faster ideation, clearer prompts, better images.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-white text-mono-900 hover:bg-mono-100 text-lg px-8 py-4 h-auto rounded-lg font-medium"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a href="#how-it-works" className="text-white/80 text-sm underline-offset-4 hover:underline">See how it works</a>
            </div>
          </div>
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
