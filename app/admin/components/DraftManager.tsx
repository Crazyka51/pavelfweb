"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Trash2, FileText } from "lucide-react"

interface Draft {
  articleId: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string
  published: boolean
  publishedAt?: string
  imageUrl: string
  timestamp: string
}

interface DraftManagerProps {
  onLoadDraft: (draft: Draft) => void
  onClose: () => void
}

export function DraftManager({ onLoadDraft, onClose }: DraftManagerProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    try {
      const storedDraft = localStorage.getItem("article_draft")
      if (storedDraft) {
        const draft: Draft = JSON.parse(storedDraft)
        setDrafts([draft]) // Only one draft is stored for now
      }
    } catch (error) {
      console.error("Failed to load drafts from localStorage:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDeleteDraft = (articleId: string) => {
    if (confirm("Opravdu chcete smazat tento koncept?")) {
      localStorage.removeItem("article_draft")
      setDrafts([])
    }
  }

  const handleLoad = (draft: Draft) => {
    onLoadDraft(draft)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Správa konceptů</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-gray-500">Načítání konceptů...</span>
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Žádné uložené koncepty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <div key={draft.articleId} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{draft.title || "Bez názvu"}</h3>
                      <p className="text-sm text-gray-500">
                        Uloženo: {new Date(draft.timestamp).toLocaleString("cs-CZ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleLoad(draft)}>
                        Načíst
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteDraft(draft.articleId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Zavřít
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
