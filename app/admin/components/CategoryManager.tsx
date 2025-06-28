'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Save, X, Tag, FolderOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
  articleCount: number
}

interface CategoryManagerProps {
  token?: string
}

export default function CategoryManager({ token }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  // Předefinované barvy pro kategorie
  const colorOptions = [
    { value: '#3B82F6', label: 'Modrá', preview: 'bg-blue-500' },
    { value: '#EF4444', label: 'Červená', preview: 'bg-red-500' },
    { value: '#10B981', label: 'Zelená', preview: 'bg-green-500' },
    { value: '#F59E0B', label: 'Oranžová', preview: 'bg-yellow-500' },
    { value: '#8B5CF6', label: 'Fialová', preview: 'bg-purple-500' },
    { value: '#06B6D4', label: 'Azurová', preview: 'bg-cyan-500' },
    { value: '#EC4899', label: 'Růžová', preview: 'bg-pink-500' },
    { value: '#6B7280', label: 'Šedá', preview: 'bg-gray-500' }
  ]

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      // Načteme všechny články pro počítání kategorií
      const authToken = token || localStorage.getItem('admin_token')
      const articlesResponse = await fetch('/api/admin/articles', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      const articles = await articlesResponse.json()

      // Výchozí kategorie (hardcoded pro jednoduchost)
      const defaultCategories = [
        'Aktuality',
        'Městská politika', 
        'Doprava',
        'Životní prostředí',
        'Kultura',
        'Sport'
      ]

      // Spočítáme články v každé kategorii a vytvoříme objekty kategorií
      const categoriesWithCounts = defaultCategories.map((categoryName, index) => {
        const articleCount = articles.filter((article: any) => article.category === categoryName).length
        
        return {
          id: `cat-${index + 1}`,
          name: categoryName,
          description: getCategoryDescription(categoryName),
          color: colorOptions[index % colorOptions.length].value,
          createdAt: new Date().toISOString(),
          articleCount
        }
      })

      setCategories(categoriesWithCounts)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryDescription = (categoryName: string): string => {
    const descriptions: { [key: string]: string } = {
      'Aktuality': 'Nejnovější události a informace z Prahy 4',
      'Městská politika': 'Rozhodnutí rady, zastupitelstva a veřejné projednávání',
      'Doprava': 'Dopravní situace, stavby a plánované změny',
      'Životní prostředí': 'Ekologie, zeleň a udržitelný rozvoj',
      'Kultura': 'Kulturní akce, události a komunitní aktivity',
      'Sport': 'Sportovní akce a podpora sportu v Praze 4'
    }
    return descriptions[categoryName] || 'Popis kategorie'
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Název kategorie je povinný!')
      return
    }

    const category: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      color: newCategory.color,
      createdAt: new Date().toISOString(),
      articleCount: 0
    }

    setCategories(prev => [...prev, category])
    setNewCategory({ name: '', description: '', color: '#3B82F6' })
    setShowAddForm(false)
    
    // V budoucnu zde bude API call pro uložení
    alert('Kategorie přidána! (V budoucí verzi bude uložena do databáze)')
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category })
  }

  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      alert('Název kategorie je povinný!')
      return
    }

    setCategories(prev => 
      prev.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      )
    )
    setEditingCategory(null)
    
    // V budoucnu zde bude API call pro aktualizaci
    alert('Kategorie aktualizována! (V budoucí verzi bude uložena do databáze)')
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return

    if (category.articleCount > 0) {
      if (!confirm(`Kategorie "${category.name}" obsahuje ${category.articleCount} článků. Opravdu ji chcete smazat? Články budou bez kategorie.`)) {
        return
      }
    } else {
      if (!confirm(`Opravdu chcete smazat kategorii "${category.name}"?`)) {
        return
      }
    }

    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    
    // V budoucnu zde bude API call pro smazání
    alert('Kategorie smazána! (V budoucí verzi bude odstraněna z databáze)')
  }

  const getColorPreview = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color)
    return colorOption?.preview || 'bg-gray-500'
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa kategorií</h1>
          <p className="text-gray-600 mt-1">
            Spravujte kategorie pro organizaci článků
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat kategorii
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nová kategorie</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název kategorie *
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Např. Veřejné osvětlení"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barva
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewCategory(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full ${color.preview} border-2 ${
                      newCategory.color === color.value ? 'border-gray-900' : 'border-gray-300'
                    } hover:scale-110 transition-transform`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popis
            </label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Krátký popis kategorie..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Přidat kategorii
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Existující kategorie ({categories.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {categories.map((category) => (
            <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
              {editingCategory && editingCategory.id === category.id ? (
                // Edit form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Název kategorie *
                      </label>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barva
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setEditingCategory(prev => prev ? { ...prev, color: color.value } : null)}
                            className={`w-8 h-8 rounded-full ${color.preview} border-2 ${
                              editingCategory.color === color.value ? 'border-gray-900' : 'border-gray-300'
                            } hover:scale-110 transition-transform`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popis
                    </label>
                    <textarea
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Zrušit
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Uložit změny
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${getColorPreview(category.color)}`}></div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-4 h-4" />
                          <span>{category.articleCount} článků</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          <span>Vytvořeno {new Date(category.createdAt).toLocaleDateString('cs-CZ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Upravit kategorii"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Smazat kategorii"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Poznámka k kategoriím</h4>
            <p className="text-sm text-blue-700 mt-1">
              Kategorie pomáhají organizovat články a usnadňují čtenářům nalezení relevantního obsahu. 
              Každý článek může mít přiřazenou jednu kategorii. Při smazání kategorie zůstanou články zachovány, 
              ale budou bez kategorie.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
