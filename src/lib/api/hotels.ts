import axios from 'axios';
import { authService } from './auth';
import { 
  Hotel, 
  CreateHotel, 
  UpdateHotel, 
  HotelRating, 
  CreateHotelRating, 
  UpdateHotelRating,
  HotelStats,
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
  console.log('Hotels API: Token found:', !!token);
  console.log('Hotels API: Token value:', token ? token.substring(0, 10) + '...' : 'none');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
    console.log('Hotels API: Authorization header set to Token format');
  } else {
    console.log('Hotels API: No token found');
  }
  
  // If the data is FormData, remove the Content-Type header to let axios set multipart/form-data
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    console.log('Hotels API: Removed Content-Type header for FormData');
  }
  
  return config;
});

// Hotel CRUD operations
export const getHotels = async (): Promise<PaginatedResponse<Hotel>> => {
  const response = await api.get('/hotels/');
  
  console.log('getHotels API response:', response.data);
  
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
      message: response.data.results.message || 'Hotels retrieved successfully'
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
      message: response.data.message || response.data.results.message || 'Hotels retrieved successfully'
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
    message: 'Hotels retrieved successfully'
  };
};

export const getHotel = async (hotelId: number): Promise<Hotel> => {
  const response = await api.get(`/hotels/${hotelId}/`);
  
  console.log('getHotel API response:', response.data);
  
  // Handle nested response structure
  if (response.data.data) {
    const hotelData = response.data.data;
    
    // Normalize images format if needed
    if (hotelData.images && Array.isArray(hotelData.images)) {
      hotelData.images = hotelData.images.map((img: string | { id: number; image: string; image_url?: string }) => {
        // If image is an object with 'image' property, convert to expected format
        if (typeof img === 'object' && 'image' in img) {
          return {
            id: img.id,
            image_url: img.image
          };
        }
        // If it's already a string or correct format, return as is
        return img;
      });
    }
    
    return hotelData;
  }
  
  return response.data;
};

export const createHotel = async (hotelData: CreateHotel | FormData): Promise<Hotel> => {
  console.log('Creating hotel with data:', hotelData);
  console.log('Is FormData:', hotelData instanceof FormData);
  
  try {
    // For FormData, let axios set the Content-Type automatically with boundary
    const response = await api.post('/hotels/', hotelData);
    console.log('Create hotel response:', response.data);
    
    // Handle nested response structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Create hotel request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    console.error('Error creating hotel:', error);
    throw error;
  }
};

export const updateHotel = async (hotelId: number, hotelData: UpdateHotel | FormData): Promise<Hotel> => {
  console.log('Updating hotel with ID:', hotelId);
  console.log('Updating hotel with data:', hotelData);
  console.log('Is FormData:', hotelData instanceof FormData);
  
  // Log FormData contents for debugging
  if (hotelData instanceof FormData) {
    console.log('FormData entries being sent:');
    for (const [key, value] of hotelData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value} (${typeof value})`);
      }
    }
  }
  
  try {
    // For FormData, let axios set the Content-Type automatically with boundary
    const response = await api.put(`/hotels/${hotelId}/`, hotelData);
    console.log('Update response:', response.data);
    
    // Handle nested response structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Update hotel request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    console.error('Error updating hotel:', error);
    throw error;
  }
};

export const partialUpdateHotel = async (hotelId: number, hotelData: Partial<UpdateHotel>): Promise<Hotel> => {
  console.log('Partially updating hotel with ID:', hotelId);
  console.log('Partial update data:', hotelData);
  
  try {
    const response = await api.patch(`/hotels/${hotelId}/`, hotelData);
    console.log('Partial update response:', response.data);
    
    // Handle nested response structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Partial update hotel request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    console.error('Error partially updating hotel:', error);
    throw error;
  }
};

export const deleteHotel = async (hotelId: number): Promise<void> => {
  console.log('Deleting hotel with ID:', hotelId);
  
  try {
    const response = await api.delete(`/hotels/${hotelId}/`);
    console.log('Delete hotel response:', response.data);
  } catch (error) {
    console.error('Delete hotel request failed. Error details:');
    if (axios.isAxiosError(error)) {
      console.error('Error message:', error.message);
      console.error('Axios error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    console.error('Error deleting hotel:', error);
    throw error;
  }
};

// Hotel Rating operations
export const getHotelRatings = async (hotelId: number): Promise<HotelRating[]> => {
  const response = await api.get(`/hotels/${hotelId}/ratings/`);
  return response.data;
};

export const createHotelRating = async (ratingData: CreateHotelRating): Promise<HotelRating> => {
  const response = await api.post('/hotel-ratings/', ratingData);
  return response.data;
};

export const updateHotelRating = async (ratingId: number, ratingData: UpdateHotelRating): Promise<HotelRating> => {
  const response = await api.put(`/hotel-ratings/${ratingId}/`, ratingData);
  return response.data;
};

export const deleteHotelRating = async (ratingId: number): Promise<void> => {
  await api.delete(`/hotel-ratings/${ratingId}/`);
};

// Hotel Stats
export const getHotelStats = async (): Promise<HotelStats> => {
  const response = await api.get('/hotels/stats/');
  return response.data;
};