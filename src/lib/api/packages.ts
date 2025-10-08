import axios from 'axios';
import { authService } from './auth';
import { 
  Package, 
  CreatePackage, 
  UpdatePackage, 
  PackageRating, 
  CreatePackageRating, 
  UpdatePackageRating,
  PackageStats,
  PaginatedResponse 
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and content type interceptor
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  console.log('Packages API: Token found:', !!token);
  console.log('Packages API: Token value:', token ? token.substring(0, 10) + '...' : 'none');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
    console.log('Packages API: Authorization header set to Token format');
  } else {
    console.log('Packages API: No token found');
  }
  
  // If the data is FormData, remove the Content-Type header to let axios set multipart/form-data
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    console.log('Packages API: Removed Content-Type header for FormData');
  }
  
  return config;
});

// Package CRUD operations
export const getPackages = async (): Promise<PaginatedResponse<Package>> => {
  const response = await api.get('/packages/');
  
  console.log('getPackages API response:', response.data);
  
  // Handle nested response structure with results.data.items
  if (response.data.results && response.data.results.data && response.data.results.data.items) {
    return {
      data: Array.isArray(response.data.results.data.items) ? response.data.results.data.items : [],
      pagination: {
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
        page_size: 12,
        current_page: 1,
        total_pages: Math.ceil((response.data.count || 0) / 12)
      },
      success: response.data.results.success || true,
      message: response.data.results.message || 'Packages retrieved successfully'
    };
  }
  
  // Handle nested response structure with data.pagination
  if (response.data.data && response.data.pagination) {
    return {
      data: Array.isArray(response.data.data) ? response.data.data : [],
      pagination: response.data.pagination,
      success: response.data.success,
      message: response.data.message
    };
  }
  
  // Handle response structure with results.data (direct array)
  if (response.data.results && response.data.results.data) {
    return {
      data: Array.isArray(response.data.results.data) ? response.data.results.data : [],
      pagination: {
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
        page_size: 12,
        current_page: 1,
        total_pages: Math.ceil((response.data.count || 0) / 12)
      },
      success: response.data.success || response.data.results.success || true,
      message: response.data.message || response.data.results.message || 'Packages retrieved successfully'
    };
  }
  
  // Handle direct response structure (fallback)
  const dataArray = response.data.results || response.data;
  
  return {
    data: Array.isArray(dataArray) ? dataArray : [],
    pagination: {
      count: response.data.count || 0,
      next: response.data.next,
      previous: response.data.previous,
      page_size: 12,
      current_page: 1,
      total_pages: Math.ceil((response.data.count || 0) / 12)
    },
    success: true,
    message: 'Packages retrieved successfully'
  };
};

export const getPackage = async (packageId: number): Promise<Package> => {
  const response = await api.get(`/packages/${packageId}/`);
  
  console.log('getPackage API response:', response.data);
  
  // Handle nested response structure
  if (response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

export const createPackage = async (packageData: CreatePackage | FormData): Promise<Package> => {
  console.log('Creating package with data:', packageData);
  console.log('Is FormData:', packageData instanceof FormData);
  
  try {
    // For FormData, let axios set the Content-Type automatically with boundary
    const response = await api.post('/packages/', packageData);
    console.log('Create package response:', response.data);
    
    // Handle nested response structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Create package request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    console.error('Error creating package:', error);
    throw error;
  }
};

export const updatePackage = async (packageId: number, packageData: UpdatePackage | FormData): Promise<Package> => {
  console.log('Updating package with ID:', packageId);
  console.log('Updating package with data:', packageData);
  console.log('Is FormData:', packageData instanceof FormData);
  
  // Log FormData contents for debugging
  if (packageData instanceof FormData) {
    console.log('FormData entries being sent:');
    for (const [key, value] of packageData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value} (${typeof value})`);
      }
    }
  }
  
  try {
    // For FormData, let axios set the Content-Type automatically with boundary
    const response = await api.put(`/packages/${packageId}/`, packageData);
    console.log('Update response:', response.data);
    
    // Handle nested response structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Update package request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    console.error('Error updating package:', error);
    throw error;
  }
};

export const partialUpdatePackage = async (packageId: number, packageData: Partial<UpdatePackage>): Promise<Package> => {
  console.log('Partially updating package with ID:', packageId);
  console.log('Partial update data:', packageData);
  
  try {
    const response = await api.patch(`/packages/${packageId}/`, packageData);
    console.log('Partial update response:', response.data);
    
    // Handle nested response structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Partial update package request failed:', error);
    throw error;
  }
};

export const deletePackage = async (packageId: number): Promise<void> => {
  console.log('Deleting package with ID:', packageId);
  
  try {
    await api.delete(`/packages/${packageId}/`);
    console.log('Package deleted successfully');
  } catch (error) {
    console.error('Delete package request failed:', error);
    throw error;
  }
};

// Package ratings operations
export const getPackageRatings = async (packageId: number): Promise<PaginatedResponse<PackageRating>> => {
  const response = await api.get(`/packages/${packageId}/ratings/`);
  
  console.log('getPackageRatings API response:', response.data);
  
  // Handle nested response structure
  if (response.data.data && response.data.pagination) {
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      success: response.data.success,
      message: response.data.message
    };
  }
  
  // Handle direct response structure
  return {
    data: response.data.results || response.data,
    pagination: {
      count: response.data.count || 0,
      next: response.data.next,
      previous: response.data.previous,
      page_size: 12,
      current_page: 1,
      total_pages: Math.ceil((response.data.count || 0) / 12)
    },
    success: true,
    message: 'Package ratings retrieved successfully'
  };
};

export const createPackageRating = async (ratingData: CreatePackageRating): Promise<PackageRating> => {
  console.log('Creating package rating:', ratingData);
  
  try {
    const response = await api.post(`/packages/${ratingData.package_id}/ratings/`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Create package rating failed:', error);
    throw error;
  }
};

export const getPackageRating = async (ratingId: number): Promise<PackageRating> => {
  try {
    const response = await api.get(`/packages/ratings/${ratingId}/`);
    return response.data;
  } catch (error) {
    console.error('Get package rating failed:', error);
    throw error;
  }
};

export const updatePackageRating = async (ratingId: number, ratingData: UpdatePackageRating): Promise<PackageRating> => {
  try {
    const response = await api.put(`/packages/ratings/${ratingId}/`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Update package rating failed:', error);
    throw error;
  }
};

export const partialUpdatePackageRating = async (ratingId: number, ratingData: Partial<UpdatePackageRating>): Promise<PackageRating> => {
  try {
    const response = await api.patch(`/packages/ratings/${ratingId}/`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Partial update package rating failed:', error);
    throw error;
  }
};

export const deletePackageRating = async (ratingId: number): Promise<void> => {
  try {
    await api.delete(`/packages/ratings/${ratingId}/`);
    console.log('Package rating deleted successfully');
  } catch (error) {
    console.error('Delete package rating failed:', error);
    throw error;
  }
};

// Package statistics
export const getPackageStats = async (): Promise<PackageStats> => {
  try {
    const response = await api.get('/packages/stats/');
    return response.data;
  } catch (error) {
    console.error('Get package stats failed:', error);
    throw error;
  }
};