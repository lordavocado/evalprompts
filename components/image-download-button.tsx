"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

interface ImageDownloadButtonProps {
  imageUrl: string
  filename?: string
  className?: string
}

export function ImageDownloadButton({ imageUrl, filename, className }: ImageDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadImage = async () => {
    if (!imageUrl || imageUrl.includes("placeholder.svg")) {
      alert("Cannot download placeholder images")
      return
    }

    setIsDownloading(true)
    try {
      // Fetch the image
      const response = await fetch(imageUrl, {
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch image")
      }

      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const defaultFilename = `evalprompts-image-${timestamp}.png`
      link.download = filename || defaultFilename

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading image:", error)
      alert('Failed to download image. Please try right-clicking and "Save image as..."')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className={`h-8 w-8 p-0 bg-white/80 hover:bg-white ${className}`}
      onClick={downloadImage}
      disabled={isDownloading}
      title="Download image"
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
    </Button>
  )
}
