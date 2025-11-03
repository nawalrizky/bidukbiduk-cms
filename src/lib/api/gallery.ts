import axios, { AxiosError } from 'axios';
import { GalleryItem, GalleryCategory, CreateGalleryItem, CreateGalleryCategory } from '../types';
import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  console.log('Gallery API: Token found:', !!token);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
    console.log('Gallery API: Authorization header set to Token format');
  } else {
    console.log('Gallery API: No token found');
  }
  
  // Remove Content-Type for FormData requests to let browser set it automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    console.log('Removed Content-Type header for FormData upload');
  }
  
  return config;
});

// Gallery Items API
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  const response = await api.get('/gallery/');
  
  // Handle the new response structure with success and data fields
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  // Fall back to previous formats for compatibility
  return Array.isArray(response.data) ? response.data : 
         response.data?.results || response.data?.data || [];
};

export const getGalleryItem = async (id: number): Promise<GalleryItem> => {
  const response = await api.get(`/gallery/${id}/`);
  
  // Handle the response structure with success and data fields
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fall back to direct response for compatibility
  return response.data;
};

export const createGalleryItem = async (item: CreateGalleryItem): Promise<GalleryItem> => {
  // Create FormData for file upload
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', item.title);
  if (item.description) {
    formData.append('description', item.description);
  }
  formData.append('category', item.category.toString());
  if (item.tags) {
    formData.append('tags', item.tags);
  }
  if (item.is_featured !== undefined) {
    formData.append('is_featured', item.is_featured.toString());
  }
  
  // Handle file upload
  if (item.file) {
    if (typeof item.file === 'string' && item.file.startsWith('data:')) {
      // Convert base64 to blob for file upload
      const response = await fetch(item.file);
      const blob = await response.blob();
      formData.append('file', blob, 'uploaded_image.jpg');
      console.log('Added blob file to FormData');
    } else if (typeof item.file === 'string' && item.file.startsWith('http')) {
      // For URL uploads, use 'image_url' field instead of 'file'
      formData.append('image_url', item.file);
      console.log('Added image URL to FormData:', item.file);
    } else if (item.file instanceof File) {
      // Handle actual File objects
      formData.append('file', item.file);
      console.log('Added File object to FormData:', item.file.name);
    }
  }
  
  // Debug: Log all FormData entries
  console.log('FormData contents:');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  
  // Get token for authentication
  const token = authService.getAccessToken();
  console.log('CreateGalleryItem: Token found:', !!token);
  
  if (!token) {
    console.log('CreateGalleryItem: No token found');
    throw new Error('Authentication required. Please log in.');
  }
  
  // Don't set Content-Type for FormData - let browser set it automatically with boundary
  // The interceptor will handle the Authorization header
  console.log('About to send FormData to API...');
  console.log('FormData entries:');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  
  try {
    const response = await api.post('/gallery/', formData);
    
    // Handle the response structure with success and data fields
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fall back to direct response for compatibility
    return response.data;
  } catch (error) {
    console.error('Request failed. Error details:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    
    // Check if it's an axios error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError;
      console.error('Axios error response:', axiosError.response?.data);
      console.error('Response data type:', typeof axiosError.response?.data);
      console.error('Response data stringified:', JSON.stringify(axiosError.response?.data, null, 2));
      console.error('Status:', axiosError.response?.status);
      console.error('Headers:', axiosError.response?.headers);
      
      // Show user-friendly error message
      const errorData = axiosError.response?.data as Record<string, unknown>;
      if (errorData) {
        console.error('Backend error details:', errorData);
        
        // Try to extract meaningful error message
        let errorMessage = 'Failed to create gallery item. ';
        if (typeof errorData === 'string') {
          errorMessage += errorData;
        } else if (errorData.error) {
          errorMessage += errorData.error;
        } else if (errorData.message) {
          errorMessage += errorData.message;
        } else if (errorData.detail) {
          errorMessage += errorData.detail;
        } else {
          // Show field-specific errors
          const fieldErrors = Object.entries(errorData)
            .filter(([key]) => key !== 'success')
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage += fieldErrors;
          }
        }
        
        throw new Error(errorMessage);
      }
    }
    
    throw error;
  }
};

export const updateGalleryItem = async (id: number, item: Partial<CreateGalleryItem>): Promise<GalleryItem> => {
  const response = await api.put(`/gallery/${id}/`, item);
  
  // Handle the response structure with success and data fields
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fall back to direct response for compatibility
  return response.data;
};

export const partialUpdateGalleryItem = async (id: number, item: Partial<CreateGalleryItem>): Promise<GalleryItem> => {
  const response = await api.patch(`/gallery/${id}/`, item);
  
  // Handle the response structure with success and data fields
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fall back to direct response for compatibility
  return response.data;
};

export const deleteGalleryItem = async (id: number): Promise<void> => {
  await api.delete(`/gallery/${id}/`);
};

// Gallery Categories API
export const getGalleryCategories = async (): Promise<GalleryCategory[]> => {
  const response = await api.get('/gallery/categories/');
  
  // Handle the new response structure with success and data fields
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  // Fall back to previous formats for compatibility
  return Array.isArray(response.data) ? response.data : 
         response.data?.results || response.data?.data || [];
};

export const getGalleryCategory = async (id: number): Promise<GalleryCategory> => {
  const response = await api.get(`/gallery/categories/${id}/`);
  return response.data;
};

export const createGalleryCategory = async (category: CreateGalleryCategory): Promise<GalleryCategory> => {
  const response = await api.post('/gallery/categories/', category);
  return response.data;
};

export const updateGalleryCategory = async (id: number, category: CreateGalleryCategory): Promise<GalleryCategory> => {
  const response = await api.put(`/gallery/categories/${id}/`, category);
  return response.data;
};

export const partialUpdateGalleryCategory = async (id: number, category: Partial<CreateGalleryCategory>): Promise<GalleryCategory> => {
  const response = await api.patch(`/gallery/categories/${id}/`, category);
  return response.data;
};

export const deleteGalleryCategory = async (id: number): Promise<void> => {
  await api.delete(`/gallery/categories/${id}/`);
};
