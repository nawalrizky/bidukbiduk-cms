import axios from 'axios';
import { authService } from './auth';
import { Article, CreateArticle, UpdateArticle, ArticleCategory, CreateArticleCategory } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export interface ArticlesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Article[];
}

// Get all articles
export const getArticles = async (params?: {
  page?: number;
  page_size?: number;
  status?: string;
  category?: number;
  search?: string;
}): Promise<ArticlesResponse> => {
  const response = await api.get('/articles/', { params });
  console.log('Articles API response:', response.data);
  
  // Handle different response structures
  if (response.data.data && Array.isArray(response.data.data)) {
    // New format: { success, message, data: [], pagination: {} }
    return {
      count: response.data.pagination?.count || response.data.data.length,
      next: response.data.pagination?.next || null,
      previous: response.data.pagination?.previous || null,
      results: response.data.data
    };
  } else if (response.data.results && Array.isArray(response.data.results)) {
    // Old format: { count, next, previous, results: [] }
    return response.data;
  } else if (Array.isArray(response.data)) {
    // Direct array format
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data
    };
  }
  
  // Fallback
  return {
    count: 0,
    next: null,
    previous: null,
    results: []
  };
};

// Get single article by ID
export const getArticle = async (id: number): Promise<Article> => {
  const response = await api.get(`/articles/${id}/`);
  console.log('Article detail API response:', response.data);
  
  // Handle different response structures
  if (response.data.data && typeof response.data.data === 'object') {
    return response.data.data;
  }
  
  return response.data;
};

// Create new article
export const createArticle = async (data: CreateArticle): Promise<Article> => {
  const formData = new FormData();
  
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('category', data.category.toString());
  
  if (data.featured_image) {
    formData.append('featured_image', data.featured_image);
  }
  
  if (data.tags) {
    formData.append('tags', data.tags);
  }
  
  if (data.status) {
    formData.append('status', data.status);
  }
  
  if (data.publish_date) {
    formData.append('publish_date', data.publish_date);
  }

  const response = await api.post('/articles/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  console.log('Create article response:', response.data);
  
  // Handle different response structures
  if (response.data.data && typeof response.data.data === 'object') {
    return response.data.data;
  }
  
  return response.data;
};

// Update article
export const updateArticle = async (id: number, data: UpdateArticle): Promise<Article> => {
  const formData = new FormData();
  
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('category', data.category.toString());
  
  if (data.featured_image instanceof File) {
    formData.append('featured_image', data.featured_image);
  }
  
  if (data.tags) {
    formData.append('tags', data.tags);
  }
  
  if (data.status) {
    formData.append('status', data.status);
  }
  
  if (data.publish_date) {
    formData.append('publish_date', data.publish_date);
  }

  const response = await api.put(`/articles/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  console.log('Update article response:', response.data);
  
  // Handle different response structures
  if (response.data.data && typeof response.data.data === 'object') {
    return response.data.data;
  }
  
  return response.data;
};

// Delete article
export const deleteArticle = async (id: number): Promise<void> => {
  await api.delete(`/articles/${id}/`);
  console.log('Article deleted:', id);
};

// Get article categories
export const getArticleCategories = async (): Promise<ArticleCategory[]> => {
  const response = await api.get('/articles/categories/');
  console.log('Article categories response:', response.data);
  
  // Handle different response structures
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  } else if (response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  return [];
};

// Create article category
export const createArticleCategory = async (data: CreateArticleCategory): Promise<ArticleCategory> => {
  const response = await api.post('/articles/categories/', data);
  return response.data;
};
