"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Trash2, Eye, EyeOff, Copy, Tag, FolderOpen, Download, Mail } from "lucide-react";

interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive" | "secondary"
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationDescription?: string
}

interface BulkActionsToolbarProps {
  selectedCount: number
  entityType: "articles" | "subscribers" | "categories"
  onAction: (actionId: string) => Promise<void>
  onClearSelection: () => void
  isLoading?: boolean
  customActions?: BulkAction[]
}

export function BulkActionsToolbar({
  selectedCount,
  entityType,
  onAction,
  onClearSelection,
  isLoading = false,
  customActions = [],
}: BulkActionsToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  const getDefaultActions = (): BulkAction[] => {
    const commonActions: BulkAction[] = [
      {
        id: "delete",
        label: "Smazat",
        icon: Trash2,
        variant: "destructive",
        requiresConfirmation: true,
        confirmationTitle: "Smazat vybrané položky?",
        confirmationDescription: `Opravdu chcete smazat ${selectedCount} ${
          selectedCount === 1 ? "položku" : selectedCount < 5 ? "položky" : "položek"
        }? Tato akce je nevratná.`,
      },
      {
        id: "export",
        label: "Exportovat",
        icon: Download,
        variant: "secondary",
      },
    ];

    switch (entityType) {
      case "articles":
        return [
          {
            id: "publish",
            label: "Publikovat",
            icon: Eye,
            variant: "default",
          },
          {
            id: "unpublish",
            label: "Zrušit publikaci",
            icon: EyeOff,
            variant: "secondary",
          },
          {
            id: "duplicate",
            label: "Duplikovat",
            icon: Copy,
            variant: "secondary",
          },
          {
            id: "update_category",
            label: "Změnit kategorii",
            icon: FolderOpen,
            variant: "secondary",
          },
          {
            id: "update_tags",
            label: "Upravit tagy",
            icon: Tag,
            variant: "secondary",
          },
          ...commonActions,
        ];

      case "subscribers":
        return [
          {
            id: "activate",
            label: "Aktivovat",
            icon: Eye,
            variant: "default",
          },
          {
            id: "deactivate",
            label: "Deaktivovat",
            icon: EyeOff,
            variant: "secondary",
          },
          {
            id: "send_email",
            label: "Odeslat e-mail",
            icon: Mail,
            variant: "default",
          },
          ...commonActions,
        ];

      case "categories":
        return [
          {
            id: "merge",
            label: "Sloučit",
            icon: Copy,
            variant: "secondary",
            requiresConfirmation: true,
            confirmationTitle: "Sloučit kategorie?",
            confirmationDescription: "Vybrané kategorie budou sloučeny do jedné.",
          },
          ...commonActions,
        ];

      default:
        return commonActions;
    }
  };

  const allActions = [...getDefaultActions(), ...customActions];

  const handleActionClick = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      await onAction(action.id);
    }
  };

  const handleConfirmedAction = async () => {
    if (confirmAction) {
      await onAction(confirmAction.id);
      setConfirmAction(null);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">
            Vybráno {selectedCount} {selectedCount === 1 ? "položka" : selectedCount < 5 ? "položky" : "položek"}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-blue-600 hover:text-blue-700">
            Zrušit výběr
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick actions */}
          {allActions.slice(0, 2).map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || "default"}
                size="sm"
                onClick={() => handleActionClick(action)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </Button>
            );
          })}

          {/* More actions dropdown */}
          {allActions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                  Další akce
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {allActions.slice(2).map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.id}>
                      {index === allActions.length - 3 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => handleActionClick(action)}
                        className={action.variant === "destructive" ? "text-red-600 focus:text-red-600" : ""}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </DropdownMenuItem>
                    </div>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.confirmationTitle || "Potvrdit akci"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmationDescription || "Opravdu chcete provést tuto akci?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={confirmAction?.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Potvrdit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
