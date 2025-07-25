"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobeIcon } from "lucide-react"

interface SeoPreviewProps {
  title: string
  description: string
  slug: string
}

export function SeoPreview({ title, description, slug }: SeoPreviewProps) {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com"
  const fullUrl = `${siteUrl}/${slug}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Náhled SEO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-blue-700">{fullUrl}</p>
          <h3 className="text-lg font-medium text-blue-800 mt-1">{title || "Název stránky"}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {description || "Krátký popis obsahu stránky pro vyhledávače."}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <GlobeIcon className="h-4 w-4" />
          <span>Jak se zobrazí ve vyhledávačích</span>
        </div>
      </CardContent>
    </Card>
  )
}
