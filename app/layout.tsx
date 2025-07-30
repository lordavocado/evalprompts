import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EvalPrompts - AI Prompt Evaluation & Optimization Platform",
  description:
    "Transform your creative ideas into high-performing AI image generation prompts. Get AI-powered evaluation, custom criteria generation, and iterative optimization for better results.",
  keywords: [
    "AI prompt optimization",
    "image generation prompts",
    "AI prompt evaluation",
    "prompt engineering",
    "AI image generation",
    "prompt improvement",
    "GPT-4 evaluation",
    "Flux AI prompts",
    "creative AI tools",
    "prompt analysis",
    "AI content creation",
    "image prompt optimization",
  ],
  authors: [{ name: "Nichlas Campos", url: "https://www.linkedin.com/in/nichlaskvist/" }],
  creator: "Nichlas Campos",
  publisher: "EvalPrompts",
  category: "AI Tools",
  classification: "AI Prompt Optimization Platform",

  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://evalprompts.vercel.app",
    siteName: "EvalPrompts",
    title: "EvalPrompts - AI Prompt Evaluation & Optimization Platform",
    description:
      "Transform your creative ideas into high-performing AI image generation prompts. Get AI-powered evaluation, custom criteria generation, and iterative optimization for better results.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EvalPrompts - AI Prompt Evaluation Platform",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "EvalPrompts - AI Prompt Evaluation Platform",
        type: "image/png",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    site: "@nkjorg",
    creator: "@nkjorg",
    title: "EvalPrompts - AI Prompt Evaluation & Optimization Platform",
    description:
      "Transform your creative ideas into high-performing AI image generation prompts. Get AI-powered evaluation, custom criteria generation, and iterative optimization.",
    images: ["/twitter-image.png"],
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification and other meta tags
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },

  // App metadata
  applicationName: "EvalPrompts",
  referrer: "origin-when-cross-origin",
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
    { media: "(prefers-color-scheme: dark)", color: "#8b5cf6" },
  ],

  // Additional structured data
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "EvalPrompts",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#8b5cf6",
    "msapplication-config": "/browserconfig.xml",
  },

  // Manifest
  manifest: "/manifest.json",

  // Icons
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.png", color: "#8b5cf6" }],
  },
    generator: 'v0.dev'
}

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EvalPrompts",
  description:
    "AI-powered prompt evaluation and optimization platform for image generation. Transform your creative ideas into high-performing prompts with custom criteria and iterative improvement.",
  url: "https://evalprompts.vercel.app",
  applicationCategory: "AI Tools",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Person",
    name: "Nichlas Campos",
    url: "https://www.linkedin.com/in/nichlaskvist/",
    sameAs: ["https://www.linkedin.com/in/nichlaskvist/", "https://x.com/nkjorg"],
  },
  featureList: [
    "AI-powered prompt evaluation",
    "Custom evaluation criteria generation",
    "GPT-4o-mini image analysis",
    "Iterative prompt optimization",
    "Real-time image generation",
    "Detailed performance analytics",
  ],
  screenshot: "https://evalprompts.vercel.app/og-image.png",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://fal.ai" />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="https://vercel.com" />
        <link rel="dns-prefetch" href="https://github.com" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://evalprompts.vercel.app" />

        {/* Alternative languages (if you plan to add them) */}
        <link rel="alternate" hrefLang="en" href="https://evalprompts.vercel.app" />

        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
