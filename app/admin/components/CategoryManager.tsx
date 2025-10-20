"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import "../styles/dynamic-colors.css";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

// Upravené rozhraní podle aktuálního schématu databáze
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  display_order: number
  is_active: boolean
  parent_id?: string
  articleCount?: number // Optional, added by API if requested
  createdAt: Date
  updatedAt: Date
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#3B82F6",
    display_order: 0,
    is_active: true,
    parent_id: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/categories?includeArticleCount=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        } else {
        }
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        // Update existing category
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            color: formData.color,
            display_order: formData.display_order,
            is_active: formData.is_active,
            parent_id: formData.parent_id || null,
          }),
        });

        if (response.ok) {
          await loadCategories();
          toast({ title: "Kategorie byla úspěšně aktualizována" });
        } else {
          const errorData = await response.json();
          toast({
            title: "Chyba při aktualizaci kategorie",
            description: errorData.message || response.statusText,
            variant: "destructive",
          });
        }
      } else {
        // Create new category
        const token = localStorage.getItem("adminToken");
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            color: formData.color,
            display_order: formData.display_order,
            is_active: formData.is_active,
            parent_id: formData.parent_id || null,
          }),
        });

        if (response.ok) {
          const newCategory = await response.json();
          setCategories([...categories, newCategory.data]);
          toast({ title: "Kategorie byla úspěšně vytvořena" });
        } else {
          const errorData = await response.json();
          toast({
            title: "Chyba při vytváření kategorie",
            description: errorData.message || response.statusText,
            variant: "destructive",
          });
        }
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        color: "#3B82F6",
        display_order: 0,
        is_active: true,
        parent_id: ""
      });
    } catch (error) {
      toast({
        title: "Chyba při ukládání kategorie",
        description: "Došlo k neočekávané chybě při ukládání kategorie",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      color: category.color || '#3B82F6',
      display_order: category.display_order || 0,
      is_active: category.is_active ?? true,
      parent_id: category.parent_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm("Opravdu chcete smazat tuto kategorii?")) {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await loadCategories();
          toast({ title: "Kategorie byla úspěšně smazána" });
        } else {
          const errorData = await response.json();
          toast({
            title: "Chyba při mazání kategorie",
            description: errorData.message || response.statusText,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Chyba při mazání kategorie",
          description: "Došlo k neočekávané chybě při mazání kategorie",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      color: "#3B82F6",
      display_order: 0,
      is_active: true,
      parent_id: ""
    });
    setIsDialogOpen(true);
  };

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
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategorie</h1>
          <p className="text-gray-600 mt-1">Správa kategorií pro články</p>
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
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color || '#3B82F6' }}></div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  {!category.is_active && (
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">Neaktivní</span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Upravit kategorii"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Smazat kategorii"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {category.articleCount || 0} článků
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  Slug: {category.slug || '-'}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  Pořadí: {category.display_order}
                </span>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Vytvořeno: {new Date(category.createdAt).toLocaleDateString("cs-CZ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné kategorie</h3>
          <p className="text-gray-600 mb-4">Začněte vytvořením první kategorie pro vaše články</p>
          <button
            onClick={handleNewCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Vytvořit novou kategorii"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="url-slug-kategorie"
                />
                <p className="text-xs text-gray-500 mt-1">Bude použito v URL. Pokud necháte prázdné, vytvoří se automaticky.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Krátký popis kategorie"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barva</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 p-1 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pořadí zobrazení</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Nižší čísla se zobrazují jako první.</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Aktivní kategorie</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Zrušit úpravy"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title={editingCategory ? "Uložit změny kategorie" : "Vytvořit novou kategorii"}
                >
                  {editingCategory ? "Uložit" : "Vytvořit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
