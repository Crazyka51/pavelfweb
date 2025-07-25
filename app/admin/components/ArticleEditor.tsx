"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { TiptapEditor } from "./TiptapEditor"
import { ArticlePreview } from "./ArticlePreview"
import { SeoPreview } from "./SeoPreview"
import { getArticleById, createArticle, updateArticle, type Article } from "@/lib/services/article-service"
import { getCategories, type Category } from "@/lib/services/category-service"

interface ArticleEditorProps {
  articleId?: string
}

export function ArticleEditor({ articleId }: ArticleEditorProps) {
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft")
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(undefined)
  const [isFeatured, setIsFeatured] = useState(false)
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [slug, setSlug] = useState("")
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }, [])

  useEffect(() => {
    if (title && !articleId) {
      // Only auto-generate slug for new articles
      setSlug(generateSlug(title))
    }
  }, [title, generateSlug, articleId])

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const data = await getCategories({})
        setCategories(data.categories)
      } catch (err) {
        console.error("Error fetching categories:", err)
        toast({
          title: "Chyba",
          description: "Nepodařilo se načíst kategorie.",
          variant: "destructive",
        })
      }
    }
    fetchCategoriesData()
  }, [toast])

  useEffect(() => {
    if (articleId) {
      setLoading(true)
      const fetchArticleData = async () => {
        try {
          const data = await getArticleById(articleId)
          if (!data) {
            throw new Error("Článek nenalezen.")
          }
          setTitle(data.title)
          setExcerpt(data.excerpt || "")
          setContent(data.content || "")
          setCategory(data.category || "")
          setImageUrl(data.imageUrl || "")
          setStatus(data.status || "draft")
          setPublishedAt(data.publishedAt ? new Date(data.publishedAt) : undefined)
          setIsFeatured(data.isFeatured || false)
          setMetaTitle(data.metaTitle || "")
          setMetaDescription(data.metaDescription || "")
          setSlug(data.slug || generateSlug(data.title))
        } catch (err: any) {
          setError(err.message || "Nepodařilo se načíst článek.")
          toast({
            title: "Chyba",
            description: err.message || "Nepodařilo se načíst článek.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchArticleData()
    }
  }, [articleId, toast, generateSlug])

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const finalStatus = publishNow ? "published" : status
    const finalPublishedAt = publishNow && !publishedAt ? new Date() : publishedAt

    const articleData = {
      title,
      excerpt,
      content,
      category,
      imageUrl,
      status: finalStatus,
      publishedAt: finalPublishedAt?.toISOString(),
      isFeatured,
      metaTitle,
      metaDescription,
      slug,
    }

    try {
      let savedArticle: Article
      if (articleId) {
        savedArticle = await updateArticle(articleId, articleData)
      } else {
        savedArticle = await createArticle({ ...articleData, createdBy: "admin" }) // Assuming 'admin' for now
      }

      toast({
        title: "Úspěch",
        description: `Článek byl ${publishNow ? "publikován" : "uložen"}!`,
        variant: "default",
      })
      if (!articleId) {
        router.push(`/admin?tab=articles`) // Redirect to article list after creating new
      } else {
        router.refresh() // Refresh current page to show updates
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Chyba",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setIsPublishing(false)
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    setIsPublishing(true)
    await handleSubmit(e, true)
  }

  if (loading) {
    return <div className="text-center py-8">Načítám článek...</div>
  }

  if (error && !loading) {
    return <div className="text-center py-8 text-red-500">Chyba: {error}</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Název článku</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="slug">URL Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="excerpt">Úryvek (krátký popis)</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="content">Obsah článku</Label>
            <TiptapEditor content={content} onContentChange={setContent} />
          </div>
          <div>
            <Label htmlFor="category">Kategorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte kategorii" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="imageUrl">URL obrázku</Label>
            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="status">Stav</Label>
            <Select value={status} onValueChange={(value: "draft" | "published" | "archived") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte stav" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Koncept</SelectItem>
                <SelectItem value="published">Publikováno</SelectItem>
                <SelectItem value="archived">Archivováno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="publishedAt">Datum publikace (volitelné)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !publishedAt && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {publishedAt ? format(publishedAt, "PPP") : <span>Vyberte datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={publishedAt} onSelect={setPublishedAt} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(!!checked)} />
            <Label htmlFor="isFeatured">Doporučený článek</Label>
          </div>
          <div>
            <Label htmlFor="metaTitle">Meta Titulek (SEO)</Label>
            <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta Popis (SEO)</Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving || isPublishing}>
              {isSaving && !isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {articleId ? "Uložit změny" : "Vytvořit koncept"}
            </Button>
            {status !== "published" && (
              <Button type="button" onClick={handlePublish} disabled={isSaving || isPublishing} variant="secondary">
                {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publikovat
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <ArticlePreview title={title} content={content} imageUrl={imageUrl} />
        <SeoPreview title={metaTitle || title} description={metaDescription || excerpt} slug={slug} />
      </div>
    </div>
  )
}
