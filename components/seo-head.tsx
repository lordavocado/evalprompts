"use client"

import { useEffect } from "react"

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

export function SEOHead({
  title = "EvalPrompts - AI Prompt Evaluation & Optimization Platform",
  description = "Transform your creative ideas into high-performing AI image generation prompts. Get AI-powered evaluation, custom criteria generation, and iterative optimization for better results.",
  image = "/og-image.png",
  url = "https://evalprompts.vercel.app",
  type = "website",
}: SEOHeadProps) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title
    }

    const upsertMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement("meta")
        document.head.appendChild(el)
      }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
    }

    const fullImageUrl = image.startsWith("http") ? image : `https://evalprompts.vercel.app${image}`

    // Primary
    upsertMeta('meta[name="title"]', { name: "title", content: title })
    upsertMeta('meta[name="description"]', { name: "description", content: description })

    // Open Graph
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type })
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url })
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title })
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description })
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: fullImageUrl })
    upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" })
    upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" })
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "EvalPrompts" })

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" })
    upsertMeta('meta[name="twitter:url"]', { name: "twitter:url", content: url })
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title })
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description })
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: fullImageUrl })
    upsertMeta('meta[name="twitter:creator"]', { name: "twitter:creator", content: "@nkjorg" })

    // LinkedIn specific
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: title })
    upsertMeta('meta[property="article:author"]', { property: "article:author", content: "Nichlas Campos" })

    // Canonical
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement("link")
      link.rel = "canonical"
      document.head.appendChild(link)
    }
    link.href = url

    // Robots
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow" })
    upsertMeta('meta[name="googlebot"]', {
      name: "googlebot",
      content: "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1",
    })
  }, [title, description, image, url, type])

  return null
}
