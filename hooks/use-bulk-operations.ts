"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface BulkOperation {
  id: string
  type: "delete" | "publish" | "unpublish" | "category" | "tags" | "activate" | "deactivate"
  label: string
  icon: string
  confirmMessage?: string
  destructive?: boolean
}

export interface BulkOperationResult {
  success: number
  failed: number
  errors: string[]
}

export function useBulkOperations() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const selectItem = useCallback((id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }, [])

  const selectAll = useCallback((items: string[]) => {
    setSelectedItems((prev) => (prev.length === items.length ? [] : items))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const executeBulkOperation = useCallback(
    async (operation: BulkOperation, endpoint: string, additionalData?: any): Promise<BulkOperationResult> => {
      if (selectedItems.length === 0) {
        toast.error("Nejprve vyberte položky")
        return { success: 0, failed: 0, errors: ["Žádné položky nevybrány"] }
      }

      if (operation.destructive && operation.confirmMessage) {
        const confirmed = window.confirm(operation.confirmMessage.replace("{count}", selectedItems.length.toString()))
        if (!confirmed) {
          return { success: 0, failed: 0, errors: ["Operace zrušena"] }
        }
      }

      setIsLoading(true)

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            operation: operation.type,
            items: selectedItems,
            ...additionalData,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result: BulkOperationResult = await response.json()

        if (result.success > 0) {
          toast.success(`Úspěšně zpracováno ${result.success} položek`)
          clearSelection()
        }

        if (result.failed > 0) {
          toast.error(`Chyba u ${result.failed} položek`)
          result.errors.forEach((error) => toast.error(error))
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Neznámá chyba"
        toast.error(`Chyba při hromadné operaci: ${errorMessage}`)
        return { success: 0, failed: selectedItems.length, errors: [errorMessage] }
      } finally {
        setIsLoading(false)
      }
    },
    [selectedItems, clearSelection],
  )

  return {
    selectedItems,
    isLoading,
    selectItem,
    selectAll,
    clearSelection,
    executeBulkOperation,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length,
  }
}
