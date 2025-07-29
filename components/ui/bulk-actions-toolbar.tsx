"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Trash2, Eye, EyeOff, Tag, FolderOpen, Copy, Download, X } from "lucide-react"

interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  destructive?: boolean
  requiresInput?: boolean
}

interface BulkActionsToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkAction: (actionId: string, data?: any) => Promise<void>
  actions: BulkAction[]
  isLoading?: boolean
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkAction,
  actions,
  isLoading = false,
}: BulkActionsToolbarProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [currentAction, setCurrentAction] = useState<BulkAction | null>(null)
  const [inputValue, setInputValue] = useState("")

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresInput) {
      setCurrentAction(action)
      setShowDialog(true)
      setInputValue("")
    } else if (action.destructive) {
      const confirmed = window.confirm(`Opravdu chcete provést akci "${action.label}" na ${selectedCount} položkách?`)
      if (confirmed) {
        onBulkAction(action.id)
      }
    } else {
      onBulkAction(action.id)
    }
  }

  const handleDialogConfirm = () => {
    if (currentAction) {
      onBulkAction(currentAction.id, { value: inputValue })
      setShowDialog(false)
      setCurrentAction(null)
      setInputValue("")
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">Vybráno {selectedCount} položek</span>
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-blue-600 hover:text-blue-700">
            <X className="w-4 h-4 mr-1" />
            Zrušit výběr
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                Hromadné akce
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {actions.map((action, index) => (
                <div key={action.id}>
                  <DropdownMenuItem
                    onClick={() => handleActionClick(action)}
                    className={action.destructive ? "text-red-600 focus:text-red-600" : ""}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                  {index < actions.length - 1 && action.destructive && <DropdownMenuSeparator />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentAction?.label}</DialogTitle>
            <DialogDescription>Zadejte hodnotu pro hromadnou akci na {selectedCount} položkách.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="bulk-input">
              {currentAction?.id === "category" && "Nová kategorie"}
              {currentAction?.id === "tags" && "Tagy (oddělené čárkou)"}
              {currentAction?.id === "source" && "Nový zdroj"}
            </Label>
            <Input
              id="bulk-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                currentAction?.id === "category"
                  ? "Zadejte kategorii..."
                  : currentAction?.id === "tags"
                    ? "tag1, tag2, tag3..."
                    : currentAction?.id === "source"
                      ? "Zadejte zdroj..."
                      : "Zadejte hodnotu..."
              }
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleDialogConfirm} disabled={!inputValue.trim()}>
              Potvrdit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Předpřipravené akce pro články
export const articleBulkActions: BulkAction[] = [
  {
    id: "publish",
    label: "Publikovat",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    id: "unpublish",
    label: "Zrušit publikaci",
    icon: <EyeOff className="w-4 h-4" />,
  },
  {
    id: "category",
    label: "Změnit kategorii",
    icon: <FolderOpen className="w-4 h-4" />,
    requiresInput: true,
  },
  {
    id: "tags",
    label: "Upravit tagy",
    icon: <Tag className="w-4 h-4" />,
    requiresInput: true,
  },
  {
    id: "duplicate",
    label: "Duplikovat",
    icon: <Copy className="w-4 h-4" />,
  },
  {
    id: "export",
    label: "Exportovat",
    icon: <Download className="w-4 h-4" />,
  },
  {
    id: "delete",
    label: "Smazat",
    icon: <Trash2 className="w-4 h-4" />,
    destructive: true,
  },
]

// Předpřipravené akce pro newsletter
export const newsletterBulkActions: BulkAction[] = [
  {
    id: "activate",
    label: "Aktivovat",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    id: "deactivate",
    label: "Deaktivovat",
    icon: <EyeOff className="w-4 h-4" />,
  },
  {
    id: "change_source",
    label: "Změnit zdroj",
    icon: <Tag className="w-4 h-4" />,
    requiresInput: true,
  },
  {
    id: "export",
    label: "Exportovat CSV",
    icon: <Download className="w-4 h-4" />,
  },
  {
    id: "delete",
    label: "Smazat",
    icon: <Trash2 className="w-4 h-4" />,
    destructive: true,
  },
]
