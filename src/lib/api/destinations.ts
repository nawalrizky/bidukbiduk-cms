import axios from 'axios';
import { Destination, DestinationCategory, CreateDestination, CreateDestinationCategory, PaginatedResponse } from '../types';
import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for large video uploads
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  // Don't set default Content-Type, let axios handle it based on data type
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  console.log('Destinations API: Token found:', !!token);
  console.log('Destinations API: Token value:', token ? token.substring(0, 10) + '...' : 'none');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
    console.log('Destinations API: Authorization header set to Token format');
  } else {
    console.log('Destinations API: No token found');
  }
  
  // Set Content-Type for non-FormData requests
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
    console.log('Destinations API: Content-Type set to application/json');
  } else if (config.data instanceof FormData) {
    console.log('Destinations API: FormData detected, letting axios set Content-Type with boundary');
    // Debug FormData contents
    if (config.data instanceof FormData) {
      console.log('FormData entries:');
      for (const [key, value] of config.data.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
  }
  
  return config;
});

// Destinations API
export const getDestinations = async (): Promise<PaginatedResponse<Destination>> => {
  const response = await api.get('/destinations/');
  console.log('getDestinations API response:', response.data);
  
  // Handle nested response structure - return the whole response object, not just the data array
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      success: response.data.success,
      message: response.data.message
    };
  }
  
  return response.data;
};

export const getDestination = async (id: number): Promise<Destination> => {
  const response = await api.get(`/destinations/${id}/`);
  console.log('getDestination API response:', response.data);
  
  // Handle nested response structure if the API returns {success: true, data: {...}}
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  
  return response.data;
};

export const createDestination = async (destination: CreateDestination | FormData): Promise<Destination> => {
  console.log('Creating destination with data:', destination);
  console.log('Is FormData:', destination instanceof FormData);
  
  try {
    // For FormData, let axios set the Content-Type automatically with boundary
    const response = await api.post('/destinations/', destination, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = progressEvent.total 
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  } catch (error) {
    console.error('Request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      console.error('Error code:', error.code);
    }
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const updateDestination = async (id: number, destination: CreateDestination | FormData): Promise<Destination> => {
  console.log('Updating destination with data:', destination);
  console.log('Is FormData:', destination instanceof FormData);
  
  try {
    // For FormData, let axios set the Content-Type automatically with boundary
    const response = await api.put(`/destinations/${id}/`, destination, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = progressEvent.total 
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      console.error('Error code:', error.code);
    }
    console.error('Error updating destination:', error);
    throw error;
  }
};

export const partialUpdateDestination = async (id: number, destination: Partial<CreateDestination>): Promise<Destination> => {
  const response = await api.patch(`/destinations/${id}/`, destination);
  return response.data;
};

export const deleteDestination = async (id: number): Promise<void> => {
  await api.delete(`/destinations/${id}/`);
};

// Destination Categories API
export const getDestinationCategories = async (): Promise<PaginatedResponse<DestinationCategory>> => {
  const response = await api.get('/destinations/categories/');
  return response.data;
};

export const getDestinationCategoriesList = async (): Promise<DestinationCategory[]> => {
  const response = await api.get('/destinations/categories/list/');
  // Handle both direct array and paginated response
  return Array.isArray(response.data) ? response.data : response.data.data || response.data.results || [];
};

export const getDestinationCategory = async (id: number): Promise<DestinationCategory> => {
  const response = await api.get(`/destinations/categories/${id}/`);
  return response.data;
};

export const createDestinationCategory = async (category: CreateDestinationCategory): Promise<DestinationCategory> => {
  const response = await api.post('/destinations/categories/', category);
  return response.data;
};

export const updateDestinationCategory = async (id: number, category: CreateDestinationCategory): Promise<DestinationCategory> => {
  const response = await api.put(`/destinations/categories/${id}/`, category);
  return response.data;
};

export const partialUpdateDestinationCategory = async (id: number, category: Partial<CreateDestinationCategory>): Promise<DestinationCategory> => {
  const response = await api.patch(`/destinations/categories/${id}/`, category);
  return response.data;
};

export const deleteDestinationCategory = async (id: number): Promise<void> => {
  await api.delete(`/destinations/categories/${id}/`);
};
