"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Tag } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  articleCount: number
  createdAt: string
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  })

  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories?includeArticleCount=true')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        } else {
          console.error('Error loading categories:', data.error)
        }
      } else {
        console.error('Failed to load categories')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")

    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            color: formData.color,
            slug,
          }),
        })

        if (response.ok) {
          await loadCategories()
          alert('Kategorie byla úspěšně aktualizována')
        } else {
          const errorData = await response.json()
          alert(`Chyba při aktualizaci kategorie: ${errorData.message}`)
        }
      } else {
        // Create new category
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            color: formData.color,
          }),
        })

        if (response.ok) {
          await loadCategories()
          alert('Kategorie byla úspěšně vytvořena')
        } else {
          const errorData = await response.json()
          alert(`Chyba při vytváření kategorie: ${errorData.message}`)
        }
      }

      setIsDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: "", description: "", color: "#3B82F6" })
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Chyba při ukládání kategorie')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (confirm("Opravdu chcete smazat tuto kategorii?")) {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadCategories()
          alert('Kategorie byla úspěšně smazána')
        } else {
          const errorData = await response.json()
          alert(`Chyba při mazání kategorie: ${errorData.message}`)
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Chyba při mazání kategorie')
      }
    }
  }

  const handleNewCategory = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", color: "#3B82F6" })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategorie</h1>
          <p className="text-gray-600 mt-1">Správa kategorií a štítků pro články</p>
        </div>
        <button
          onClick={handleNewCategory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nová kategorie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {category.description && <p className="text-gray-600 text-sm mb-3">{category.description}</p>}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">#{category.slug}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{category.articleCount} článků</span>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Vytvořeno: {new Date(category.createdAt).toLocaleDateString("cs-CZ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné kategorie</h3>
          <p className="text-gray-600 mb-4">Začněte vytvořením první kategorie pro vaše články</p>
          <button
            onClick={handleNewCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Vytvořit první kategorii
          </button>
        </div>
      )}

      {/* Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">{editingCategory ? "Upravit kategorii" : "Nová kategorie"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Název</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Název kategorie"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Popis kategorie (volitelné)"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Barva</label>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? "Uložit" : "Vytvořit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
