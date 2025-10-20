"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Mail, FileText, Bell } from "lucide-react";

interface CMSSettings {
  // Editor nastavení
  defaultCategory: string | null // Now stores category ID
  autoSaveInterval: number
  allowImageUpload: boolean
  maxFileSize: number

  // Publikování
  requireApproval: boolean
  defaultVisibility: "public" | "draft"
  enableScheduling: boolean

  // Notifikace
  emailNotifications: boolean
  newArticleNotification: boolean
  adminEmail: string

  updatedAt?: string
}

interface CategoryOption {
  id: string
  name: string
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<CMSSettings>({
    defaultCategory: null, // Default to null, will be populated from DB
    autoSaveInterval: 3000,
    allowImageUpload: true,
    maxFileSize: 5,

    requireApproval: false,
    defaultVisibility: "draft",
    enableScheduling: true,

    emailNotifications: true,
    newArticleNotification: true,
    adminEmail: "pavel@praha4.cz",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    loadSettings();
    loadCategoriesForOptions();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        if (data.updatedAt) {
          setLastSaved(new Date(data.updatedAt).toLocaleString("cs-CZ"));
        }
      } else {
      }
    } catch (error) {
    }
  };

  const loadCategoriesForOptions = async () => {
    try {
      // Přidáno ověření autorizace a token
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return;
      }

      const response = await fetch("/api/admin/categories?activeOnly=true", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"  // Důležité pro přenos cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.categories) {
          setCategoryOptions(data.categories.map((cat: any) => ({ id: cat.id, name: cat.name })));
        } else {
          setCategoryOptions([]);
        }
      } else {
      }
    } catch (error) {
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings); // Update with potentially normalized data from backend
        setLastSaved(new Date(data.settings.updatedAt).toLocaleString("cs-CZ"));
        alert("Nastavení úspěšně uloženo!");
      } else {
        const errorData = await response.json();
        alert(`Chyba při ukládání nastavení: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      alert("Chyba při ukládání nastavení!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Opravdu chcete obnovit výchozí nastavení? Všechny změny budou ztraceny.")) {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "POST", // POST for reset
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
          setLastSaved(new Date(data.settings.updatedAt).toLocaleString("cs-CZ"));
          alert("Nastavení bylo obnoveno na výchozí hodnoty");
        } else {
          const errorData = await response.json();
          alert(`Chyba při obnovování nastavení: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        alert("Chyba při obnovování nastavení!");
      }
    }
  };

  const tabs = [
    { id: "editor", label: "Editor", icon: FileText },
    { id: "notifications", label: "Notifikace", icon: Bell },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "editor":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Výchozí kategorie</label>
                <select
                  value={settings.defaultCategory || ""} // Use empty string for null
                  onChange={(e) => setSettings((prev) => ({ ...prev, defaultCategory: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Vyberte kategorii --</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interval auto-uložení (ms)</label>
                <input
                  type="number"
                  min="1000"
                  max="60000"
                  step="1000"
                  value={settings.autoSaveInterval}
                  onChange={(e) => setSettings((prev) => ({ ...prev, autoSaveInterval: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximální velikost souboru (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Výchozí viditelnost článků</label>
                <select
                  value={settings.defaultVisibility}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, defaultVisibility: e.target.value as "public" | "draft" }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Koncept</option>
                  <option value="public">Publikováno</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowImageUpload"
                  checked={settings.allowImageUpload}
                  onChange={(e) => setSettings((prev) => ({ ...prev, allowImageUpload: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowImageUpload" className="ml-2 block text-sm text-gray-700">
                  Povolit upload obrázků
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableScheduling"
                  checked={settings.enableScheduling}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enableScheduling: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableScheduling" className="ml-2 block text-sm text-gray-700">
                  Povolit plánování publikování
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={settings.requireApproval}
                  onChange={(e) => setSettings((prev) => ({ ...prev, requireApproval: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-700">
                  Vyžadovat schválení před publikováním
                </label>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                  Povolit emailové notifikace
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newArticleNotification"
                  checked={settings.newArticleNotification}
                  onChange={(e) => setSettings((prev) => ({ ...prev, newArticleNotification: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!settings.emailNotifications}
                />
                <label
                  htmlFor="newArticleNotification"
                  className={`ml-2 block text-sm ${settings.emailNotifications ? "text-gray-700" : "text-gray-400"}`}
                >
                  Notifikace při publikování nového článku
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Emailové notifikace</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Notifikace budou odesílány na email: <strong>{settings.adminEmail}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nastavení systému</h1>
          <p className="text-gray-600 mt-1">Konfigurace CMS systému a preferencí</p>
          {lastSaved && <p className="text-sm text-green-600 mt-1">Naposledy uloženo: {lastSaved}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Obnovit výchozí
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Ukládání..." : "Uložit nastavení"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">{renderTabContent()}</div>
    </div>
  );
}
