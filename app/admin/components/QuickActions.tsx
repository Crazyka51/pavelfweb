"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share,
  Download,
  Globe,
  EyeOff,
  PlusCircleIcon,
  MailIcon,
  BarChartIcon,
  SettingsIcon,
} from "lucide-react"
import type { Article } from "@/lib/types"

interface QuickActionsProps {
  article: Article
  onEdit: () => void
  onPreview: () => void
  onDelete: () => void
  onDuplicate: () => void
  onTogglePublish: () => void
  onCopyUrl?: () => void
}

export function QuickActions({
  article,
  onEdit,
  onPreview,
  onDelete,
  onDuplicate,
  onTogglePublish,
  onCopyUrl,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/articles/new">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center bg-transparent">
            <PlusCircleIcon className="h-6 w-6 mb-2" />
            Nový článek
          </Button>
        </Link>
        <Link href="/admin?tab=newsletter">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center bg-transparent">
            <MailIcon className="h-6 w-6 mb-2" />
            Odeslat newsletter
          </Button>
        </Link>
        <Link href="/admin?tab=analytics">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center bg-transparent">
            <BarChartIcon className="h-6 w-6 mb-2" />
            Zobrazit analytiku
          </Button>
        </Link>
        <Link href="/admin?tab=settings">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center bg-transparent">
            <SettingsIcon className="h-6 w-6 mb-2" />
            Nastavení
          </Button>
        </Link>
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Více akcí"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {isOpen && (
            <>
              {/* Overlay pro zavření menu */}
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {/* Náhled */}
                  <Button
                    onClick={() => handleAction(onPreview)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Náhled
                  </Button>

                  {/* Upravit */}
                  <Button
                    onClick={() => handleAction(onEdit)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Upravit
                  </Button>

                  <hr className="my-1 border-gray-200" />

                  {/* Publikovat/Zrušit publikování */}
                  <Button
                    onClick={() => handleAction(onTogglePublish)}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
                      article.status === "published"
                        ? "text-orange-700 hover:bg-orange-50"
                        : "text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {article.status === "published" ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Zrušit publikování
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        Publikovat
                      </>
                    )}
                  </Button>

                  {/* Duplikovat */}
                  <Button
                    onClick={() => handleAction(onDuplicate)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplikovat
                  </Button>

                  {/* Kopírovat URL (pouze pro publikované) */}
                  {article.status === "published" && onCopyUrl && (
                    <Button
                      onClick={() => handleAction(onCopyUrl)}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Share className="w-4 h-4" />
                      Kopírovat URL
                    </Button>
                  )}

                  {/* Export */}
                  <Button
                    onClick={() => handleAction(() => exportArticle(article))}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exportovat
                  </Button>

                  <hr className="my-1 border-gray-200" />

                  {/* Smazat */}
                  <Button
                    onClick={() => handleAction(onDelete)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Smazat
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Funkce pro export článku
function exportArticle(article: Article) {
  const exportData = {
    ...article,
    exportedAt: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `clanek-${article.title.toLowerCase().replace(/[^a-z0-9]/gi, "-")}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
