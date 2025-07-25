"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  getNewsletterTemplates,
  createNewsletterTemplate,
  updateNewsletterTemplate,
  deleteNewsletterTemplate,
  type NewsletterTemplate,
} from "@/lib/services/newsletter-service"

export function TemplateManager() {
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTemplate, setNewTemplate] = useState<Partial<NewsletterTemplate>>({
    name: "",
    subject: "",
    content: "",
    html_content: "",
    is_active: true,
  })
  const [editingTemplate, setEditingTemplate] = useState<NewsletterTemplate | null>(null)
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNewsletterTemplates()
      setTemplates(data)
    } catch (err: any) {
      console.error("Error fetching templates:", err)
      setError(err.message || "Nepodařilo se načíst šablony.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se načíst šablony.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      if (editingTemplate) {
        await updateNewsletterTemplate(editingTemplate.id, {
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: newTemplate.content,
          html_content: newTemplate.html_content,
          is_active: newTemplate.is_active,
        })
      } else {
        await createNewsletterTemplate({
          name: newTemplate.name!,
          subject: newTemplate.subject!,
          content: newTemplate.content!,
          html_content: newTemplate.html_content!,
          is_active: newTemplate.is_active!,
          created_by: "admin", // Assuming admin for now
        })
      }

      toast({
        title: "Úspěch",
        description: `Šablona byla úspěšně ${editingTemplate ? "aktualizována" : "vytvořena"}.`,
        variant: "default",
      })
      setNewTemplate({ name: "", subject: "", content: "", html_content: "", is_active: true })
      setEditingTemplate(null)
      fetchTemplates()
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

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return

    setIsDeleting(true)
    try {
      const success = await deleteNewsletterTemplate(deleteTemplateId)

      if (!success) {
        throw new Error("Failed to delete template.")
      }

      toast({
        title: "Úspěch",
        description: "Šablona byla úspěšně smazána.",
        variant: "default",
      })
      setDeleteTemplateId(null)
      fetchTemplates()
    } catch (err: any) {
      console.error("Error deleting template:", err)
      setError(err.message || "Nepodařilo se smazat šablonu.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se smazat šablonu.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (template: NewsletterTemplate) => {
    setEditingTemplate(template)
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      html_content: template.html_content,
      is_active: template.is_active,
    })
  }

  const closeDialog = () => {
    setEditingTemplate(null)
    setNewTemplate({ name: "", subject: "", content: "", html_content: "", is_active: true })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Načítám šablony...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Správa šablon</h2>
        <Button onClick={() => closeDialog()}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Nová šablona
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Žádné šablony k zobrazení.</p>
          <Button onClick={() => closeDialog()} className="mt-4">
            Vytvořit první šablonu
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Předmět</TableHead>
                <TableHead>Aktivní</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>{template.is_active ? "Ano" : "Ne"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEditDialog(template)}>Upravit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeleteTemplateId(template.id)}>Smazat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={newTemplate.name !== "" || !!editingTemplate} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Upravit šablonu" : "Nová šablona"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrUpdateTemplate} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="templateName" className="text-right">
                Název
              </Label>
              <Input
                id="templateName"
                value={newTemplate.name || ""}
                onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="templateSubject" className="text-right">
                Předmět
              </Label>
              <Input
                id="templateSubject"
                value={newTemplate.subject || ""}
                onChange={(e) => setNewTemplate((prev) => ({ ...prev, subject: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="templateContent" className="text-right">
                Obsah (HTML)
              </Label>
              <Textarea
                id="templateContent"
                value={newTemplate.content || ""}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, content: e.target.value, html_content: e.target.value }))
                }
                className="col-span-3 min-h-[200px]"
                required
              />
            </div>
            <div className="flex items-center space-x-2 col-span-4 justify-end">
              <input
                type="checkbox"
                id="isActive"
                checked={newTemplate.is_active || false}
                onChange={(e) => setNewTemplate((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive">Aktivní</Label>
            </div>
            <DialogFooter className="col-span-4">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSaving}>
                Zrušit
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTemplate ? "Uložit změny" : "Vytvořit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chcete smazat tuto šablonu?</AlertDialogTitle>
            <AlertDialogDescription>Tato akce je nevratná. Šablona bude trvale odstraněna.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
