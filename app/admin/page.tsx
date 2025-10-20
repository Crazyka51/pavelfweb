"use client";

import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./components/Dashboard";
import ArticleManager from "./components/ArticleManager";
import ArticleEditor from "./components/ArticleEditor";
import CategoryManager from "./components/CategoryManager";
import SettingsManager from "./components/SettingsManager";
import AnalyticsManager from "./components/AnalyticsManager";
import { Article, ArticleStatus } from "@/types/cms";
import { useAuth } from '@/lib/auth-context';

type AdminSection =
  | "dashboard"
  | "articles"
  | "new-article"
  | "media"
  | "categories"
  | "analytics"
  | "backup"
  | "settings"

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Při první inicializaci načíst články
    loadArticles();
  }, []);
  
  // Centralizovaná funkce pro načítání článků
  // API chyba handler
  const handleApiError = (error: any, defaultMessage: string) => {
    
    // Zajištění, že se zobrazí jen textová zpráva, nikoliv kód
    let errorMessage = defaultMessage;
    if (error && typeof error === 'object' && error.message) {
      errorMessage = `${defaultMessage}: ${error.message}`;
    }
    
    alert(errorMessage);
  };

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      
      // Použijeme pomocnou funkci pro autorizovaný fetch
      const response = await import('@/lib/auth-fetch')
        .then(module => module.authorizedFetch("/api/admin/articles", {
          headers: {
            'Content-Type': 'application/json'
          }
        }));
      
      if (!response.ok) {
        throw new Error(`HTTP chyba ${response.status}: ${response.statusText}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error("Nelze zpracovat odpověď serveru");
      }
      
      if (result && result.success) {
        // Validace a formátování dat
        const articles = result.data && result.data.articles ? result.data.articles : [];
        const validatedArticles = articles.map((article: any) => {
          if (!article) return null;
          
          return {
            id: article.id || `article-${Math.random().toString(36).substr(2, 9)}`,
            title: article.title || "Bez názvu",
            content: article.content || "",
            excerpt: article.excerpt || null,
            category: article.category || { id: "default", name: "Nezařazeno" },
            categoryId: article.categoryId || "default",
            tags: Array.isArray(article.tags) ? article.tags : [],
            status: article.status || ArticleStatus.DRAFT,
            published: article.status === ArticleStatus.PUBLISHED,
            createdAt: article.createdAt || new Date().toISOString(),
            updatedAt: article.updatedAt || new Date().toISOString(),
            author: article.author || { id: "system", name: "Systém" },
            authorId: article.authorId || "system",
            imageUrl: article.imageUrl || null,
            publishedAt: article.publishedAt || null
          };
        }).filter(Boolean); // Odstraní null hodnoty
        
        setArticles(validatedArticles);
      } else {
        handleApiError(null, `Chyba při načítání článků: ${result.error || "Neznámá chyba"}`);
      }
    } catch (error) {
      handleApiError(error, "Chyba při načítání článků");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section as AdminSection);
    setEditingArticleId(null);
  };

  const handleCreateNew = () => {
    setEditingArticleId(null);
    setCurrentSection("new-article");
  };

  const handleEditArticle = (article: any) => {
    setEditingArticleId(article.id);
    setCurrentSection("new-article");
  };

  const handleBackToDashboard = () => {
    setCurrentSection("dashboard");
    setEditingArticleId(null);
  };

  const handleBackToArticles = () => {
    // Po uložení článku znovu načíst data před přepnutím na seznam článků
    loadArticles().then(() => {
      setCurrentSection("articles");
      setEditingArticleId(null);
    });
  };

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Záloha byla úspěšně vytvořena.');
      } else {
        alert('Nepodařilo se vytvořit zálohu.');
      }
    } catch (error) {
      alert('Došlo k chybě při vytváření zálohy.');
    }
  };

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard articles={articles} onCreateNew={handleCreateNew} onRefresh={loadArticles} />;
      case "articles":
        return <ArticleManager articles={articles} onEditArticle={handleEditArticle} onCreateNew={handleCreateNew} onRefresh={loadArticles} />;
      case "new-article":
        return (
          <div className="p-8 bg-white min-h-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingArticleId ? "Upravit článek" : "Nový článek"}
            </h2>
            <div className="bg-white">
              <ArticleEditor
                articleId={editingArticleId || undefined}
                onSave={handleBackToArticles}
                onCancel={editingArticleId ? handleBackToArticles : handleBackToDashboard}
              />
            </div>
          </div>
        );
      case "media":
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Správa médií</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <iframe 
                src="/admin/media"
                className="w-full min-h-[70vh] border-none"
                title="Správa médií"
              />
            </div>
          </div>
        );
      case "categories":
        return <CategoryManager />;
      case "analytics":
        return <AnalyticsManager />;
      case "backup":
        return (
          <div className="p-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Zálohy</h2>
              <p className="text-gray-600">Export a import dat systému</p>
              <button
                onClick={handleBackup}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Vytvořit zálohu
              </button>
            </div>
          </div>
        );
      case "settings":
        return <SettingsManager />;
      default:
        return <Dashboard />;
    }
  };

  // Příprava aktuálního uživatele pro AdminLayout
  const currentUser = user ? {
    username: user.username,
    displayName: user.displayName || user.username
  } : null;
  
  // Funkce pro odhlášení
  const handleLogout = async () => {
    await logout();
  };

  return (
    <AdminLayout
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
      onLogout={handleLogout}
      currentUser={currentUser}
    >
      {renderContent()}
    </AdminLayout>
  );
}