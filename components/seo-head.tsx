"use client"

import Head from "next/head"

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
  const fullImageUrl = image.startsWith("http") ? image : `https://evalprompts.vercel.app${image}`

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="EvalPrompts" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:creator" content="@nkjorg" />

      {/* LinkedIn specific */}
      <meta property="og:image:alt" content={title} />
      <meta property="article:author" content="Nichlas Campos" />

      {/* Additional SEO tags */}
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
    </Head>
  )
}
