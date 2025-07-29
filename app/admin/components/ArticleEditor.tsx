"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { getArticleById, createArticle, updateArticle } from "@/lib/services/article-service"
import { getCategories } from "@/lib/services/category-service"

// Local type definitions to avoid issues with Prisma client type generation
enum ArticleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

type Category = {
  id: string;
  name: string;
};

// This local type mirrors the Prisma schema and is used throughout the component
// to ensure type safety without relying on the generated client.
type ArticleForEditor = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  status: ArticleStatus;
  isFeatured: boolean;
  categoryId: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

// A simple placeholder for a rich text editor
const SimpleEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <Textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={15}
    className="prose dark:prose-invert"
  />
)

interface ArticleEditorProps {
  articleId?: string
  onSave?: () => void
  onCancel?: () => void
}

export default function ArticleEditor({ articleId, onSave, onCancel }: ArticleEditorProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState<ArticleStatus>(ArticleStatus.DRAFT)
  const [isFeatured, setIsFeatured] = useState(false)
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")

  // Data state
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/&/g, '-and-')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const result = await getCategories({})
        setCategories(result.categories)
      } catch (error) {
        toast({ title: "Chyba při načítání kategorií", variant: "destructive" })
      }
    }
    fetchCategories()
  }, [toast])

  useEffect(() => {
    // Fetch article data if editing
    if (articleId) {
      setIsLoading(true)
      getArticleById(articleId)
        .then((article) => {
          if (article) {
            // Cast the fetched article to our local type to ensure type safety
            const data = article as unknown as ArticleForEditor
            setTitle(data.title)
            setSlug(data.slug)
            setContent(data.content)
            setExcerpt(data.excerpt || "")
            setImageUrl(data.imageUrl || "")
            setCategoryId(data.categoryId)
            setStatus(data.status)
            setIsFeatured(data.isFeatured)
            setMetaTitle(data.metaTitle || "")
            setMetaDescription(data.metaDescription || "")
          }
        })
        .catch(() => toast({ title: "Chyba při načítání článku", variant: "destructive" }))
        .finally(() => setIsLoading(false))
    }
  }, [articleId, toast])


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    if (!articleId) { // Only auto-generate slug for new articles
      setSlug(generateSlug(e.target.value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const articleData = {
      title,
      slug,
      content,
      excerpt,
      imageUrl,
      categoryId,
      status,
      isFeatured,
      metaTitle,
      metaDescription,
      tags: [], // Tags not implemented in this version
    }

    try {
      if (articleId) {
        await updateArticle(articleId, articleData)
        toast({ title: "Článek úspěšně aktualizován" })
      } else {
        // Hardcoded authorId from seed script
        const authorId = "cmdoymk9i0000xuss9ydk9h5j"
        await createArticle({ ...articleData, authorId })
        toast({ title: "Článek úspěšně vytvořen" })
      }
      if (onSave) onSave()
      router.refresh() // Refresh the page to show changes
    } catch (error: any) {
      toast({
        title: "Došlo k chybě",
        description: error.message || "Nepodařilo se uložit článek.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div>Načítání...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Název</Label>
        <Input id="title" value={title} onChange={handleTitleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Obsah</Label>
        <SimpleEditor value={content} onChange={setContent} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Úryvek</Label>
        <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL obrázku</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte kategorii" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Stav</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ArticleStatus)} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ArticleStatus.DRAFT}>Koncept</SelectItem>
              <SelectItem value={ArticleStatus.PUBLISHED}>Publikováno</SelectItem>
              <SelectItem value={ArticleStatus.ARCHIVED}>Archivováno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(!!checked)} />
        <Label htmlFor="isFeatured">Doporučený článek</Label>
      </div>
      
      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-lg font-medium">SEO Nastavení</h3>
         <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Zrušit</Button>}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Ukládání..." : "Uložit článek"}
        </Button>
      </div>
    </form>
  )
}
