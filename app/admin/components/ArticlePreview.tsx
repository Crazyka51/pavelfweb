"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import DOMPurify from "dompurify"

interface ArticlePreviewProps {
  title: string
  content: string
  imageUrl?: string
}

export function ArticlePreview({ title, content, imageUrl }: ArticlePreviewProps) {
  // Simple HTML sanitization for preview
  const createMarkup = (htmlString: string) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html")
    return { __html: DOMPurify.sanitize(doc.body.innerHTML) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Náhled článku</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
          <div className="relative w-full h-48 rounded-md overflow-hidden">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Náhled obrázku"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        )}
        <h3 className="text-xl font-bold">{title || "Název článku"}</h3>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={createMarkup(content || '<p class="text-gray-500">Obsah článku...</p>')}
        />
      </CardContent>
    </Card>
  )
}
