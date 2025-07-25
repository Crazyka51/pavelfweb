"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/lib/services/category-service"

interface CategoriesResponse {
  categories: Category[]
  total: number
  hasMore: boolean
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [hasMore, setHasMore] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  const fetchCategoriesData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { categories, total, hasMore } = await getCategories({ page, limit })
      setCategories(categories)
      setHasMore(hasMore)
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError(err.message || "Nepodařilo se načíst kategorie.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se načíst kategorie.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoriesData()
  }, [page, limit])

  const handleCreateOrUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: newCategoryName })
      } else {
        await createCategory({ name: newCategoryName })
      }

      toast({
        title: "Úspěch",
        description: `Kategorie byla úspěšně ${editingCategory ? "aktualizována" : "vytvořena"}.`,
        variant: "default",
      })
      setNewCategoryName("")
      setEditingCategory(null)
      fetchCategoriesData() // Refresh the list
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Chyba",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return

    setIsDeleting(true)
    try {
      const success = await deleteCategory(deleteCategoryId)

      if (!success) {
        throw new Error("Failed to delete category.")
      }

      toast({
        title: "Úspěch",
        description: "Kategorie byla úspěšně smazána.",
        variant: "default",
      })
      setDeleteCategoryId(null)
      fetchCategoriesData() // Refresh the list
    } catch (err: any) {
      console.error("Error deleting category:", err)
      setError(err.message || "Nepodařilo se smazat kategorii.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se smazat kategorii.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
  }

  const closeEditDialog = () => {
    setEditingCategory(null)
    setNewCategoryName("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Správa kategorií</h2>
        <Button
          onClick={() => {
            setEditingCategory(null)
            setNewCategoryName("")
          }}
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Nová kategorie
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Načítám kategorie...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <Button onClick={fetchCategoriesData} className="mt-4">
            Zkusit znovu
          </Button>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Žádné kategorie k zobrazení.</p>
          <Button
            onClick={() => {
              setEditingCategory(null)
              setNewCategoryName("")
            }}
            className="mt-4"
          >
            Vytvořit první kategorii
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název kategorie</TableHead>
                <TableHead>Počet článků</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.articleCount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEditDialog(category)}>Upravit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeleteCategoryId(category.id)}>Smazat</DropdownMenuItem>
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

      <Dialog open={newCategoryName !== "" || !!editingCategory} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Upravit kategorii" : "Nová kategorie"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrUpdateCategory} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Název
              </Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog} disabled={isSaving}>
                Zrušit
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? "Uložit změny" : "Vytvořit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chcete smazat tuto kategorii?</AlertDialogTitle>
            <AlertDialogDescription>
              Tato akce je nevratná. Kategorie bude trvale odstraněna. Všechny články přiřazené k této kategorii budou
              mít kategorii nastavenou na NULL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
