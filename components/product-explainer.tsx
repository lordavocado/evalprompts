"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Zap, TrendingUp, ArrowRight } from "lucide-react"

interface ProductExplainerProps {
  onGetStarted: () => void
}

export function ProductExplainer({ onGetStarted }: ProductExplainerProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-mono-900">
            Make your prompts pop ✨
          </h1>
          <p className="mt-6 text-lg md:text-xl text-mono-600 max-w-2xl mx-auto leading-relaxed">
            Tell us what you want to create. We’ll craft, score, and refine prompts until they shine — all in a clean, simple UI.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-mono-900 hover:bg-mono-800 text-white px-6 py-3 h-auto rounded-full"
            >
              Try it now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <p className="mt-3 text-sm text-mono-500">No sign-up • Your API keys stay on your device</p>
        </section>

        {/* How it works */}
        <section className="mt-28">
          <h2 className="text-center text-2xl md:text-3xl font-semibold text-mono-900">How it works</h2>
          <p className="mt-3 text-center text-mono-600">A friendly loop that turns vague ideas into crisp prompts.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-mono-200">
            <div className="flex flex-col items-center px-6 py-8">
              <div className="h-10 w-10 rounded-full border border-mono-300 flex items-center justify-center text-mono-700">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="mt-3 text-base font-medium text-mono-900">Describe</h3>
              <p className="mt-1 text-sm text-mono-600">Tell us what you want to create</p>
            </div>
            <div className="flex flex-col items-center px-6 py-8">
              <div className="h-10 w-10 rounded-full border border-mono-300 flex items-center justify-center text-mono-700">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="mt-3 text-base font-medium text-mono-900">Generate</h3>
              <p className="mt-1 text-sm text-mono-600">AI creates custom criteria & optimized prompts</p>
            </div>
            <div className="flex flex-col items-center px-6 py-8">
              <div className="h-10 w-10 rounded-full border border-mono-300 flex items-center justify-center text-mono-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="mt-3 text-base font-medium text-mono-900">Improve</h3>
              <p className="mt-1 text-sm text-mono-600">Evaluate & refine automatically</p>
            </div>
          </div>
        </section>

        {/* Audience chips */}
        <section className="mt-20">
          <p className="text-center text-mono-700">Perfect for</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {["Digital artists", "Marketers", "Businesses", "Game developers"].map((label) => (
              <span key={label} className="text-sm text-mono-700 border border-mono-200 rounded-full px-3 py-1 bg-white">
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Simple CTA */}
        <section className="mt-24 border-t border-mono-200 pt-10 text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-mono-900">Launch something beautiful today</h3>
          <p className="mt-2 text-mono-600">Faster ideation, clearer prompts, better images.</p>
          <div className="mt-6">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-mono-900 hover:bg-mono-800 text-white px-6 py-3 h-auto rounded-full"
            >
              Get started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center text-sm text-mono-500">
          <p>Made by Nichlas Campos • <a className="underline underline-offset-4 hover:text-mono-700" href="https://www.linkedin.com/in/nichlaskvist/" target="_blank" rel="noopener noreferrer">LinkedIn</a> · <a className="underline underline-offset-4 hover:text-mono-700" href="https://x.com/nkjorg" target="_blank" rel="noopener noreferrer">X</a></p>
        </footer>
      </div>
    </div>
  )
}
