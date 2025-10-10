"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Search } from "lucide-react";

interface EditableText {
  id: string;
  component: string;
  textKey: string;
  value: string;
  lang: string;
  createdAt: string;
  updatedAt: string;
}

export default function TextsManager() {
  const [texts, setTexts] = useState<EditableText[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState({
    component: "",
    textKey: "",
    value: "",
    lang: "cs"
  });

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/texts");
      const data = await response.json();

      if (data.success) {
        setTexts(data.data || []);
      } else {
        alert("Chyba při načítání textů: " + data.error);
      }
    } catch (error) {
      console.error("Error loading texts:", error);
      alert("Chyba při načítání textů");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newText.component || !newText.textKey || !newText.value) {
      alert("Vyplňte všechna povinná pole");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/texts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newText)
      });

      const data = await response.json();

      if (data.success) {
        setTexts([...texts, data.data]);
        setIsAdding(false);
        setNewText({ component: "", textKey: "", value: "", lang: "cs" });
      } else {
        alert("Chyba při vytváření textu: " + data.error);
      }
    } catch (error) {
      console.error("Error creating text:", error);
      alert("Chyba při vytváření textu");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/texts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, value: editValue })
      });

      const data = await response.json();

      if (data.success) {
        setTexts(texts.map(t => t.id === id ? data.data : t));
        setEditingId(null);
        setEditValue("");
      } else {
        alert("Chyba při aktualizaci textu: " + data.error);
      }
    } catch (error) {
      console.error("Error updating text:", error);
      alert("Chyba při aktualizaci textu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento text?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/texts?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTexts(texts.filter(t => t.id !== id));
      } else {
        alert("Chyba při mazání textu: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting text:", error);
      alert("Chyba při mazání textu");
    }
  };

  const startEdit = (text: EditableText) => {
    setEditingId(text.id);
    setEditValue(text.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const filteredTexts = texts.filter(
    t =>
      t.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.textKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group texts by component
  const groupedTexts = filteredTexts.reduce((acc, text) => {
    if (!acc[text.component]) {
      acc[text.component] = [];
    }
    acc[text.component].push(text);
    return acc;
  }, {} as Record<string, EditableText[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Načítání textů...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Správa textů</h1>
        <p className="text-gray-600">
          Upravujte texty jednotlivých komponent napříč webem
        </p>
      </div>

      {/* Search and Add button */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Hledat podle komponenty, klíče nebo textu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Přidat text
        </button>
      </div>

      {/* Add new text form */}
      {isAdding && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Nový text</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Komponenta *
              </label>
              <input
                type="text"
                placeholder="např. hero, about, contact"
                value={newText.component}
                onChange={e => setNewText({ ...newText, component: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Klíč *
              </label>
              <input
                type="text"
                placeholder="např. title, description"
                value={newText.textKey}
                onChange={e => setNewText({ ...newText, textKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text *
            </label>
            <textarea
              placeholder="Zadejte text..."
              value={newText.value}
              onChange={e => setNewText({ ...newText, value: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewText({ component: "", textKey: "", value: "", lang: "cs" });
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Vytvořit
            </button>
          </div>
        </div>
      )}

      {/* Texts list grouped by component */}
      {Object.keys(groupedTexts).length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600 mb-4">Zatím nejsou žádné texty</p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Přidat první text
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTexts).map(([component, componentTexts]) => (
            <div key={component} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{component}</h3>
                <p className="text-sm text-gray-600">{componentTexts.length} textů</p>
              </div>
              <div className="divide-y divide-gray-200">
                {componentTexts.map(text => (
                  <div key={text.id} className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {text.textKey}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {text.lang}
                          </span>
                        </div>
                        {editingId === text.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleUpdate(text.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                              >
                                <Save className="w-4 h-4" />
                                Uložit
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
                              >
                                <X className="w-4 h-4" />
                                Zrušit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 mt-1">{text.value}</p>
                        )}
                      </div>
                      {editingId !== text.id && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEdit(text)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Upravit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(text.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Smazat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
