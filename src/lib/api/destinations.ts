import axios from 'axios';
import { Destination, DestinationCategory, CreateDestination, CreateDestinationCategory, PaginatedResponse } from '../types';
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
  console.log('Destinations API: Token found:', !!token);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
    console.log('Destinations API: Authorization header set to Token format');
  } else {
    console.log('Destinations API: No token found');
  }
  return config;
});

// Destinations API
export const getDestinations = async (): Promise<PaginatedResponse<Destination>> => {
  const response = await api.get('/destinations/');
  return response.data;
};

export const getDestination = async (id: number): Promise<Destination> => {
  const response = await api.get(`/destinations/${id}/`);
  return response.data;
};

export const createDestination = async (destination: CreateDestination): Promise<Destination> => {
  const response = await api.post('/destinations/', destination);
  return response.data;
};

export const updateDestination = async (id: number, destination: CreateDestination): Promise<Destination> => {
  const response = await api.put(`/destinations/${id}/`, destination);
  return response.data;
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
  return Array.isArray(response.data) ? response.data : response.data.results || response.data.data || [];
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
