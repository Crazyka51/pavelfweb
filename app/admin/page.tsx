"use client";

import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./components/Dashboard";
import ArticleManager from "./components/ArticleManager";
import ArticleEditor from "./components/ArticleEditor";
import CategoryManager from "./components/CategoryManager";
import NewsletterManager from "./components/NewsletterManager";
import SettingsManager from "./components/SettingsManager";
import AnalyticsManager from "./components/AnalyticsManager";
import { Article, ArticleStatus } from "@/types/cms";

type AdminSection =
  | "dashboard"
  | "articles"
  | "new-article"
  | "categories"
  | "newsletter"
  | "analytics"
  | "backup"
  | "settings"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName: string } | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    checkAuthentication();
  }, []);
  
  useEffect(() => {
    // Jen když jsme přihlášení a není aktivní načítání
    if (isAuthenticated && !isLoading) {
      // Použijeme setTimeout pro zajištění, že se UI stihne aktualizovat
      const timer = setTimeout(() => {
        loadArticles();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);
  
  // Centralizovaná funkce pro načítání článků
  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleApiError(null, "Nejste přihlášeni. Přihlaste se prosím znovu.");
        return;
      }
      
      const response = await fetch("/api/admin/articles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
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
        console.log("Centrálně načtené články:", result.data);
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

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/admin/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setCurrentUser({ 
          username: data.user?.username || 'admin', 
          displayName: data.user?.displayName || 'Pavel Fišer' 
        });
      } else {
        // Tichá chyba - bez alert okna
        console.error('Autentizace selhala:', response.status);
        localStorage.removeItem("adminToken"); // Odstranění neplatného tokenu
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Důležité pro cookies
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        // Uložení tokenu do localStorage
        localStorage.setItem('adminToken', data.token);
        
        setIsAuthenticated(true);
        setCurrentUser({ 
          username: data.user?.username || credentials.username, 
          displayName: data.user?.displayName || 'Pavel Fišer' 
        });
      } else {
        throw new Error(data.message || 'Přihlášení selhalo');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Přihlášení selhalo: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include', // Důležité pro cookies
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentSection("dashboard");
      setCurrentUser(null);
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
    // Předej jen ID článku místo celého objektu, který může mít cyklické reference
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
      console.error('Chyba při vytváření zálohy:', error);
      alert('Došlo k chybě při vytváření zálohy.');
    }
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    // Zajištění, že se zobrazí jen textová zpráva, nikoliv kód
    let errorMessage = defaultMessage;
    if (error && typeof error === 'object' && error.message) {
      errorMessage = `${defaultMessage}: ${error.message}`;
    }
    
    alert(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nyní je autentizace aktivní
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard articles={articles} onCreateNew={handleCreateNew} onRefresh={loadArticles} />;
      case "articles":
        return <ArticleManager articles={articles} onEditArticle={handleEditArticle} onCreateNew={handleCreateNew} onRefresh={loadArticles} />;
      case "new-article":
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingArticleId ? "Upravit článek" : "Nový článek"}
            </h2>
            <ArticleEditor
              articleId={editingArticleId || undefined}
              onSave={handleBackToArticles}
              onCancel={editingArticleId ? handleBackToArticles : handleBackToDashboard}
            />
          </div>
        );
      case "categories":
        return <CategoryManager />;
      case "newsletter":
        return <NewsletterManager />;
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