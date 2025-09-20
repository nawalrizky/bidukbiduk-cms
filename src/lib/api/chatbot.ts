import axios from 'axios';
import { ChatbotResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendChatbotMessage = async (message: string): Promise<ChatbotResponse> => {
  const response = await api.post('/chatbot/message', {
    message: message
  });
  return response.data;
};
