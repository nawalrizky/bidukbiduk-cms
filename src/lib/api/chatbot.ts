import axios from 'axios';
import { ChatbotResponse, ChatbotContent } from '../types';
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
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const sendChatbotMessage = async (message: string): Promise<ChatbotResponse> => {
  const response = await api.post('/chatbot/message', {
    message: message
  });
  return response.data;
};

export const getChatbotContent = async (): Promise<ChatbotContent> => {
  const response = await api.get('/chatbot/content');
  
  // Handle wrapped response structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fall back to direct response for compatibility
  return response.data;
};

export const updateChatbotContent = async (content: string): Promise<ChatbotContent> => {
  const response = await api.put('/chatbot/content', {
    content: content
  });
  
  // Handle wrapped response structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fall back to direct response for compatibility
  return response.data;
};
