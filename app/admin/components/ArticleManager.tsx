"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon, PlusCircleIcon, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getArticles, deleteArticle, type Article } from "@/lib/services/article-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCategories, type Category } from "@/lib/services/category-service"

interface ArticlesResponse {
  articles: Article[]
  total: number
  hasMore: boolean
}

export function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [hasMore, setHasMore] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  const fetchArticlesData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { articles, total, hasMore } = await getArticles({
        page,
        limit,
        category: filterCategory,
        status: filterStatus,
        search: searchQuery,
      })
      setArticles(articles)
      setHasMore(hasMore)
    } catch (err: any) {
      console.error("Error fetching articles:", err)
      setError(err.message || "Nepodařilo se načíst články.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se načíst články.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    fetchArticlesData()
    fetchCategoriesData()
  }, [page, limit, filterCategory, filterStatus, searchQuery]) // Re-fetch when filters or pagination change

  const handleDelete = async () => {
    if (!deleteArticleId) return

    setIsDeleting(true)
    try {
      const success = await deleteArticle(deleteArticleId)

      if (!success) {
        throw new Error("Failed to delete article.")
      }

      toast({
        title: "Úspěch",
        description: "Článek byl úspěšně smazán.",
        variant: "default",
      })
      setDeleteArticleId(null)
      fetchArticlesData() // Refresh the list
    } catch (err: any) {
      console.error("Error deleting article:", err)
      setError(err.message || "Nepodařilo se smazat článek.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se smazat článek.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "draft":
        return "secondary"
      case "archived":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Správa článků</h2>
        <Link href="/admin/articles/new">
          <Button>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Nový článek
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Hledat články..."
          className="max-w-sm flex-1"
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value || undefined)}
        />
        <Select
          value={filterCategory}
          onValueChange={(value) => setFilterCategory(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrovat dle kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny kategorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value === "all" ? undefined : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrovat dle stavu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny stavy</SelectItem>
            <SelectItem value="published">Publikováno</SelectItem>
            <SelectItem value="draft">Koncept</SelectItem>
            <SelectItem value="archived">Archivováno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Načítám články...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <Button onClick={fetchArticlesData} className="mt-4">
            Zkusit znovu
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Žádné články k zobrazení.</p>
          <Link href="/admin/articles/new">
            <Button className="mt-4">Vytvořit první článek</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Datum publikace</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(article.status)}>{article.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("cs-CZ")
                      : "Není publikováno"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/articles/${article.id}`}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Upravit</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onSelect={() => setDeleteArticleId(article.id)}>Smazat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1 || loading}
        >
          Předchozí
        </Button>
        <Button variant="outline" onClick={() => setPage((prev) => prev + 1)} disabled={!hasMore || loading}>
          Další
        </Button>
      </div>

      <AlertDialog open={!!deleteArticleId} onOpenChange={(open) => !open && setDeleteArticleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chcete smazat tento článek?</AlertDialogTitle>
            <AlertDialogDescription>Tato akce je nevratná. Článek bude trvale odstraněn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
