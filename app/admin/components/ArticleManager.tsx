"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  Tag,
  MoreVertical,
  Plus,
  Download,
  CheckSquare,
  Square,
  FileText,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Article, ArticleStatus } from "@/types/cms";
import { authorizedFetch, checkApiStatus } from "@/lib/auth-fetch";

interface ArticleManagerProps {
  onEditArticle?: (article: Article) => void;
  onCreateNew?: () => void;
  articles?: Article[];
  onRefresh?: () => Promise<void>;
}

export default function ArticleManager({ onEditArticle, onCreateNew, articles: propArticles = [], onRefresh }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{status: 'unknown' | 'ok' | 'error', message: string}>({
    status: 'unknown', 
    message: 'API status není znám'
  });

  const categories = ["Aktuality", "Městská politika", "Doprava", "Životní prostředí", "Kultura", "Sport"];

  // Diagnostická funkce pro kontrolu přístupu k API
  const checkApiAccess = useCallback(async () => {
    try {
      // Diagnostika autentizačního stavu
      const adminToken = localStorage.getItem('adminToken');
      console.log("Auth diagnostika - adminToken existuje:", !!adminToken);
      
      if (!adminToken) {
        setApiStatus({status: 'error', message: 'Chybí autentizační token'});
        return false;
      }
      
      // Použijeme utility funkci z auth-fetch.ts
      const isApiOk = await checkApiStatus('/api/admin/articles');
      
      if (isApiOk) {
        setApiStatus({status: 'ok', message: 'API je dostupné'});
        return true;
      } else {
        setApiStatus({
          status: 'error', 
          message: 'API není dostupné nebo token je neplatný'
        });
        return false;
      }
    } catch (error) {
      console.error("API diagnostika selhala:", error);
      setApiStatus({
        status: 'error', 
        message: `API diagnostika selhala: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      });
      return false;
    }
  }, []);
  
  // Funkce pro načítání článků
  const loadArticles = useCallback(async () => {
    try {
      console.log("loadArticles called");
      setIsLoading(true);
      
      // Použijeme authorizedFetch pro automatické přidání tokenu
      const response = await authorizedFetch("/api/admin/articles", {
        method: 'GET',
        debug: false // Vypneme debug pro snížení množství logů
      });

      if (!response.ok) {
        console.error("API response not OK:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(`HTTP chyba ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        // Přidáváme console.log pro vypsání struktury objektů článků z API
        console.log("Loaded articles from API - total count:", result.data.articles?.length || 0);
        console.log("Article IDs loaded:", result.data.articles?.map((a: any) => a.id) || []);
        
        // Validace dat článků pro zajištění, že všechny objekty mají požadované vlastnosti
        const articles = result.data.articles || [];
        const validatedArticles = articles.map((article: any) => {
          if (!article) return null;
          
          // Ověříme, zda objekt má základní požadované vlastnosti a přidáme výchozí hodnoty kde je potřeba
          return {
            id: article.id || `article-${Math.random().toString(36).substr(2, 9)}`,
            title: article.title || "Bez názvu",
            content: article.content || "",
            excerpt: article.excerpt || null,
            category: article.category || { id: "default", name: "Nezařazeno" },
            categoryId: article.categoryId || "default",
            tags: Array.isArray(article.tags) ? article.tags : [],
            status: article.status || "DRAFT",
            createdAt: article.createdAt || new Date().toISOString(),
            updatedAt: article.updatedAt || new Date().toISOString(),
            author: article.author || { id: "system", name: "Systém" },
            authorId: article.authorId || "system",
            imageUrl: article.imageUrl || null,
            publishedAt: article.publishedAt || null
          };
        }).filter(Boolean); // Odstraní null hodnoty
        
        console.log("Validated articles:", validatedArticles.length);
        setArticles(validatedArticles);
      } else {
        console.error("Chyba při načítání článků:", result.error);
        alert(`Chyba při načítání článků: ${result.error || "Neznámá chyba"}`);
      }
    } catch (error) {
      console.error("Chyba při načítání článků:", error);
      
      // Podrobnější diagnostika chyby
      let errorMessage = "Neznámá chyba";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Detekce typických problémů
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Nepodařilo se kontaktovat server. Zkontrolujte síťové připojení nebo zda server běží.";
          console.log("Server je pravděpodobně nedostupný nebo blokován CORS politikou");
        } else if (error.message.includes('NetworkError')) {
          errorMessage = "Síťová chyba. Zkontrolujte připojení k internetu.";
        } else if (error.message.includes('401')) {
          errorMessage = "Nemáte oprávnění k této akci. Zkuste se odhlásit a znovu přihlásit.";
          console.log("Pravděpodobně vypršela platnost tokenu nebo chybí token");
        } else if (error.message.includes('404')) {
          errorMessage = "API endpoint nebyl nalezen. Zkontrolujte URL.";
        } else if (error.message.includes('500')) {
          errorMessage = "Interní chyba serveru. Zkuste to později nebo kontaktujte administrátora.";
        }
      }
      
      alert(`Chyba při načítání článků: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Aktualizujeme články, když se změní props
  useEffect(() => {
    // Zkontrolujeme stav API jen při prvním načtení
    checkApiAccess().catch(console.error);
    
    if (propArticles && propArticles.length > 0) {
      console.log("ArticleManager: Použití článků z props", propArticles.length);
      setArticles(propArticles);
      setIsLoading(false);
    } else if (onRefresh) {
      // Pokud nejsou články v props, použijeme onRefresh pro jejich načtení
      setIsLoading(true);
      onRefresh().then(() => setIsLoading(false));
    } else {
      // Fallback na původní metodu načítání - pouze jednou
      setIsLoading(true);
      loadArticles().finally(() => setIsLoading(false));
    }
  }, [propArticles]); // Odstraněny závislosti, které způsobovaly opakované volání

  const filterArticles = useCallback(() => {
    let filtered = [...articles];

    // Text search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(search) ||
          (article.excerpt || "").toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search) ||
          article.tags.some((tag) => tag.toLowerCase().includes(search)),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category.name === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "all") {
      switch (selectedStatus) {
        case "published":
          filtered = filtered.filter((article) => article.status === "PUBLISHED");
          break;
        case "draft":
          filtered = filtered.filter((article) => article.status === "DRAFT");
          break;
        case "scheduled":
          filtered = filtered.filter((article) => article.publishedAt && new Date(article.publishedAt) > new Date());
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "title":
          compareValue = a.title.localeCompare(b.title);
          break;
        case "created":
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updated":
        default:
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredArticles(filtered);
  }, [articles, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Odstraněn původní useEffect, který volal loadArticles, protože nyní řídíme načítání pomocí props

  useEffect(() => {
    filterArticles();
  }, [filterArticles]);

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map((article) => article.id));
    }
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) {
      alert("Nejprve vyberte články ke smazání");
      return;
    }

    if (confirm(`Opravdu chcete smazat ${selectedArticles.length} článků?`)) {
      try {
        // Použijeme authorizedFetch pro automatické přidání tokenu
        for (const articleId of selectedArticles) {
          const response = await authorizedFetch(`/api/admin/articles/${articleId}`, {
            method: "DELETE",
            debug: true
          });

          const result = await response.json();
          if (!result.success) {
            throw new Error(`Chyba při mazání článku ${articleId}: ${result.error}`);
          }
        }
        await loadArticles();
        setSelectedArticles([]);
        alert("Články byly úspěšně smazány");
      } catch (error) {
        console.error("Error deleting articles:", error);
        alert(`Chyba při mazání článků: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
      }
    }
  };

  const handleBulkPublish = async () => {
    if (selectedArticles.length === 0) return;
    try {
      // Použijeme authorizedFetch pro automatické přidání tokenu
      for (const articleId of selectedArticles) {
        const response = await authorizedFetch(`/api/admin/articles/${articleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PUBLISHED" }),
        });
        
        const result = await response.json();
        if (!result.success) {
          console.error(`Chyba při publikování článku ${articleId}: ${result.error}`);
        }
      }
      await loadArticles();
      setSelectedArticles([]);
      alert("Články byly úspěšně publikovány");
    } catch (error) {
      console.error("Error publishing articles:", error);
      alert("Chyba při publikování článků");
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedArticles.length === 0) return;
    try {
      // Použijeme authorizedFetch pro automatické přidání tokenu
      for (const articleId of selectedArticles) {
        const response = await authorizedFetch(`/api/admin/articles/${articleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "DRAFT" }),
        });
        
        const result = await response.json();
        if (!result.success) {
          console.error(`Chyba při převádění na koncept ${articleId}: ${result.error}`);
        }
      }
      await loadArticles();
      setSelectedArticles([]);
      alert("Články byly převedeny na koncepty");
    } catch (error) {
      console.error("Error unpublishing articles:", error);
      alert("Chyba při převádění na koncepty");
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    console.log("handleDeleteArticle called for ID:", articleId);
    
    if (confirm("Opravdu chcete smazat tento článek?")) {
      try {
        console.log("User confirmed deletion, calling API...");
        
        // Použijeme authorizedFetch pro automatické přidání tokenu
        const response = await authorizedFetch(`/api/admin/articles/${articleId}`, {
          method: "DELETE",
          debug: true
        });

        console.log("DELETE API response status:", response.status);
        console.log("DELETE API response headers:", Object.fromEntries(response.headers.entries()));

        const result = await response.json();
        console.log("DELETE API response body:", result);
        
        if (result.success) {
          console.log("DELETE successful, reloading articles...");
          await loadArticles();
          console.log("Articles reloaded after deletion");
          alert("Článek byl úspěšně smazán");
        } else {
          console.log("DELETE failed with result:", result);
          throw new Error(result.error || "Neznámá chyba při mazání článku");
        }
      } catch (error) {
        console.error("Error deleting article:", error);
        alert(`Chyba při mazání článku: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
      }
    } else {
      console.log("User cancelled deletion");
    }
  };

  const handleDuplicateArticle = async (article: any) => {
    try {
      // Přidáno logování pro lepší diagnostiku
      console.log("Duplicating article:", article);
      
      const newArticleData = {
        title: `${article.title} (Kopie)`,
        content: article.content,
        excerpt: article.excerpt,
        categoryId: article.categoryId,
        tags: article.tags || [],
        imageUrl: article.imageUrl,
        status: "DRAFT",
        authorId: article.authorId, // přidáno authorId pro správnou funkčnost
      };

      // Použijeme authorizedFetch pro automatické přidání tokenu
      const response = await authorizedFetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticleData),
        debug: true
      });

      const result = await response.json();
      if (result.success) {
        await loadArticles();
        alert("Článek byl úspěšně duplikován");
      } else {
        throw new Error(result.error || "Chyba při duplikování článku");
      }
    } catch (error) {
      console.error("Error duplicating article:", error);
      alert(`Chyba při duplikování článku: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
    }
  };

  const exportArticles = () => {
    // Vytvořit nové pole objektů bez cyklických referencí
    const exportableArticles = filteredArticles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryName: article.category.name,
      categoryId: article.categoryId,
      tags: article.tags,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      authorName: article.author.name,
      authorId: article.authorId,
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt,
    }));
    
    const dataStr = JSON.stringify(exportableArticles, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `articles_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Neplatné datum"; // Vrátí informaci o neplatném datu
    }
    return date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (article: Article) => {
    if (article.publishedAt && new Date(article.publishedAt) > new Date()) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Naplánováno</span>
      );
    }
    switch (article.status) {
      case "PUBLISHED":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Publikováno</span>;
      case "DRAFT":
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Koncept</span>;
      case "ARCHIVED":
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Archivováno</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{article.status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Stavové hlášky API */}
      {apiStatus.status === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700 font-medium">API chyba: {apiStatus.message}</span>
          </div>
          <p className="mt-2 text-sm text-red-600">
            Pokud problém přetrvává, zkuste se odhlásit a znovu přihlásit, nebo kontaktujte administrátora.
          </p>
          <button
            onClick={() => checkApiAccess()}
            className="mt-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Znovu zkontrolovat API
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Správa článků</h2>
          <p className="text-gray-600 mt-1">
            Celkem {articles.length} článků • Zobrazeno {filteredArticles.length}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => {
              // Manuálně obnovit články
              setIsLoading(true);
              loadArticles()
                .then(() => {
                  console.log("Články byly úspěšně obnoveny");
                })
                .catch(error => {
                  console.error("Chyba při obnovování článků:", error);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                 className="w-4 h-4 mr-2">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 12a9 9 0 0 0 6.7 15L13 24"></path>
              <path d="M14 22h7v-7"></path>
            </svg>
            Obnovit
          </button>
          <button
            onClick={exportArticles}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              // Před vytvořením nového článku zkontrolujeme API
              checkApiAccess().then(isOk => {
                if (isOk && onCreateNew) {
                  onCreateNew();
                } else if (!isOk) {
                  alert("API není dostupné nebo nemáte platný token. Zkuste se odhlásit a znovu přihlásit.");
                }
              });
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nový článek
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Hledat články..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny kategorie</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny stavy</option>
            <option value="published">Publikováno</option>
            <option value="draft">Koncepty</option>
            <option value="scheduled">Naplánováno</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field as "updated" | "created" | "title");
              setSortOrder(order as "asc" | "desc");
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="updated-desc">Nejnovější</option>
            <option value="updated-asc">Nejstarší</option>
            <option value="title-asc">Název A-Z</option>
            <option value="title-desc">Název Z-A</option>
            <option value="created-desc">Datum vytvoření ↓</option>
            <option value="created-asc">Datum vytvoření ↑</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">Vybráno {selectedArticles.length} článků</span>
              <button onClick={() => setSelectedArticles([])} className="text-sm text-blue-600 hover:text-blue-700">
                Zrušit výběr
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkPublish}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Publikovat
              </button>
              <button
                onClick={handleBulkUnpublish}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Koncept
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné články nenalezeny</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Zkuste změnit filtry nebo vyhledávací dotaz."
                : "Zatím nemáte žádné články. Vytvořte svůj první článek!"}
            </p>
            {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
              <button
                onClick={() => {
                  // Před vytvořením nového článku zkontrolujeme API
                  checkApiAccess().then(isOk => {
                    if (isOk && onCreateNew) {
                      onCreateNew();
                    } else if (!isOk) {
                      alert("API není dostupné nebo nemáte platný token. Zkuste se odhlásit a znovu přihlásit.");
                    }
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vytvořit první článek
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button onClick={handleSelectAll} className="text-gray-400 hover:text-gray-600">
                      {selectedArticles.length === filteredArticles.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Článek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktualizováno
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectArticle(article.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedArticles.includes(article.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        {article.imageUrl ? (
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : null}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{article.title}</h4>
                          <p className="text-sm text-gray-500 truncate">{article.excerpt || 'Bez popisku'}</p>
                          {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="text-xs text-gray-400">+{article.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{article.category?.name || "Bez kategorie"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(article)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.updatedAt ? formatDate(article.updatedAt) : "Neznámé datum"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === article.id ? null : article.id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showActions === article.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  // Předej jen základní informace místo celého objektu, který může mít cyklické reference
                                  if (onEditArticle) {
                                    onEditArticle({
                                      id: article.id,
                                      title: article.title,
                                      // Zbytek potřebných vlastností bude načten při otevření editoru
                                    } as any);
                                  }
                                  setShowActions(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-3" />
                                Upravit
                              </button>
                              <button
                                onClick={() => {
                                  // Vytváříme nový objekt pouze s potřebnými vlastnostmi a zabráníme předání cyklických referencí
                                  const articleToDuplicate = {
                                    id: article.id,
                                    title: article.title,
                                    content: article.content || "",
                                    excerpt: article.excerpt,
                                    categoryId: article.categoryId,
                                    // Ošetření případu, kdy tags může být undefined
                                    tags: Array.isArray(article.tags) ? [...article.tags] : [],
                                    imageUrl: article.imageUrl,
                                    status: article.status,
                                  };
                                  console.log("Article to duplicate:", articleToDuplicate);
                                  handleDuplicateArticle(articleToDuplicate);
                                  setShowActions(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Copy className="w-4 h-4 mr-3" />
                                Duplikovat
                              </button>
                              <a
                                href={`/aktuality/${article.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowActions(null)}
                              >
                                <Eye className="w-4 h-4 mr-3" />
                                Náhled
                              </a>
                              <button
                                onClick={() => {
                                  handleDeleteArticle(article.id);
                                  setShowActions(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Smazat
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
