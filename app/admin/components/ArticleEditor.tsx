"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import MediaPickerDialog from './MediaPickerDialog';
import { Image } from 'lucide-react';

const MediaEnabledTiptapEditor = dynamic(() => import('./MediaEnabledTiptapEditor'), { 
  ssr: false,
  loading: () => <p>Načítání editoru...</p> 
});

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

interface ArticleEditorProps {
  articleId?: string
  onSave?: () => void
  onCancel?: () => void
}

export default function ArticleEditor({ articleId, onSave, onCancel }: ArticleEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<ArticleStatus>(ArticleStatus.DRAFT);
  const [isFeatured, setIsFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/&/g, '-and-')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories", {
          credentials: 'include', // Přidáno pro použití HTTP-only cookies
        });
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        } else {
          toast({ title: "Chyba při načítání kategorií", description: result.error, variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Chyba při načítání kategorií", variant: "destructive" });
      }
    };
    fetchCategories();
  }, [toast]);

  useEffect(() => {
    // Fetch article data if editing
    if (articleId) {
      setIsLoading(true);
      fetch(`/api/admin/articles/${articleId}`, {
        credentials: 'include', // Přidáno pro použití HTTP-only cookies
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            const data = result.data as ArticleForEditor;
            setTitle(data.title);
            setSlug(data.slug);
            setContent(data.content);
            setExcerpt(data.excerpt || "");
            setImageUrl(data.imageUrl || "");
            setCategoryId(data.categoryId);
            setStatus(data.status);
            setIsFeatured(data.isFeatured);
            setMetaTitle(data.metaTitle || "");
            setMetaDescription(data.metaDescription || "");
          } else {
            toast({ title: "Chyba při načítání článku", description: result.error, variant: "destructive" });
          }
        })
        .catch(() => toast({ title: "Chyba při načítání článku", variant: "destructive" }))
        .finally(() => setIsLoading(false));
    }
  }, [articleId, toast]);


  const generateMetaTags = useCallback((title: string, content: string) => {
    // Generování meta title
    const metaTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    
    // Generování meta description z obsahu
    // Odstranění HTML tagů a získání prvních cca 150 znaků
    const plainContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const metaDescription = plainContent.length > 150 
      ? plainContent.substring(0, 147) + '...' 
      : plainContent;
    
    return { metaTitle, metaDescription };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (!articleId) { // Only auto-generate slug for new articles
      setSlug(generateSlug(newTitle));
    }
    
    // Auto-generování meta tagů pokud jsou prázdné
    if (!metaTitle.trim() && newTitle.trim()) {
      const { metaTitle: autoMetaTitle } = generateMetaTags(newTitle, content);
      setMetaTitle(autoMetaTitle);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Auto-generování meta description pokud je prázdná
    if (!metaDescription.trim() && newContent.trim() && title.trim()) {
      const { metaDescription: autoMetaDescription } = generateMetaTags(title, newContent);
      setMetaDescription(autoMetaDescription);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Přidaná validace
    if (!title.trim()) {
      toast({ title: "Chyba", description: "Název článku je povinný", variant: "destructive" });
      return;
    }
    
    if (!categoryId) {
      toast({ title: "Chyba", description: "Vyberte kategorii pro článek", variant: "destructive" });
      return;
    }
    
    if (!content.trim()) {
      toast({ title: "Chyba", description: "Obsah článku je povinný", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);

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
    };

    try {
      const url = articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles";
      const method = articleId ? "PUT" : "POST";


      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Přidáno pro použití HTTP-only cookies
        body: JSON.stringify(articleData),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: articleId ? "Článek úspěšně aktualizován" : "Článek úspěšně vytvořen" });
        if (onSave) onSave();
        router.refresh();
      } else {
        toast({
          title: "Došlo k chybě",
          description: result.error || "Nepodařilo se uložit článek.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Došlo k chybě",
        description: error.message || "Nepodařilo se uložit článek.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Načítání...</div>;

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
        <MediaEnabledTiptapEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Zde napište obsah článku..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Úryvek</Label>
        <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL obrázku</Label>
        <div className="flex gap-2">
          <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <MediaPickerDialog 
            onSelectMedia={(url) => setImageUrl(url)} 
            trigger={
              <Button type="button" variant="outline" size="icon">
                <Image className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte kategorii" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(categories) && categories.map((cat) => (
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">SEO Nastavení</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (title.trim() && content.trim()) {
                const { metaTitle: autoMetaTitle, metaDescription: autoMetaDescription } = generateMetaTags(title, content);
                setMetaTitle(autoMetaTitle);
                setMetaDescription(autoMetaDescription);
                toast({ title: "Meta tagy byly automaticky vygenerovány" });
              } else {
                toast({ 
                  title: "Nelze generovat meta tagy", 
                  description: "Nejprve vyplňte název a obsah článku",
                  variant: "destructive" 
                });
              }
            }}
          >
            🤖 Generovat automaticky
          </Button>
        </div>
         <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input 
              id="metaTitle" 
              value={metaTitle} 
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Automaticky vygenerováno při vyplnění názvu"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea 
              id="metaDescription" 
              value={metaDescription} 
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Automaticky vygenerováno při vyplnění obsahu"
            />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Zrušit</Button>}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Ukládání..." : "Uložit článek"}
        </Button>
      </div>
    </form>
  );
}
