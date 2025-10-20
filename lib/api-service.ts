// lib/api-service.ts
// Centrální místo pro API volání

import { Article, Category, ArticleStatus, CreateArticleInput, UpdateArticleInput } from '@/types/cms';

/**
 * Centrální služba pro volání API
 */
export class ApiService {
  private getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  }

  /**
   * Obecná metoda pro volání API
   */
  private async fetchApi<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Nejste přihlášeni. Přihlaste se prosím znovu.');
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };

    if (data && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP chyba ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Neznámá chyba');
    }

    return result.data;
  }

  /**
   * Načte seznam článků
   */
  async getArticles(params: {
    page?: number;
    limit?: number;
    status?: ArticleStatus;
    search?: string;
    category?: string;
  } = {}): Promise<{
    articles: Article[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);

    const url = `/api/admin/articles${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    return this.fetchApi(url);
  }

  /**
   * Načte detail článku podle ID
   */
  async getArticleById(id: string): Promise<Article> {
    return this.fetchApi(`/api/admin/articles/${id}`);
  }

  /**
   * Vytvoří nový článek
   */
  async createArticle(data: CreateArticleInput): Promise<Article> {
    return this.fetchApi('/api/admin/articles', 'POST', data);
  }

  /**
   * Aktualizuje článek
   */
  async updateArticle(id: string, data: UpdateArticleInput): Promise<Article> {
    return this.fetchApi(`/api/admin/articles/${id}`, 'PUT', data);
  }

  /**
   * Smaže článek
   */
  async deleteArticle(id: string): Promise<boolean> {
    await this.fetchApi(`/api/admin/articles/${id}`, 'DELETE');
    return true;
  }

  /**
   * Načte seznam kategorií
   */
  async getCategories(): Promise<Category[]> {
    return this.fetchApi('/api/admin/categories');
  }

  /**
   * Verifikuje token uživatele
   */
  async verifyToken(): Promise<{ isValid: boolean; user: any }> {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        return { isValid: false, user: null };
      }
      
      const data = await response.json();
      return { isValid: true, user: data.user };
    } catch (error) {
      return { isValid: false, user: null };
    }
  }

  /**
   * Přihlásí uživatele
   */
  async login(credentials: { username: string; password: string }): Promise<{ success: boolean; user: any }> {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Přihlášení selhalo');
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Odhlásí uživatele
   */
  async logout(): Promise<boolean> {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();
