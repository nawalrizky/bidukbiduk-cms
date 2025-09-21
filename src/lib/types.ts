// Gallery Types
export interface GalleryCategory {
  id: number;
  name: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  category: number;
  category_name?: string;
  file?: string;
  file_url?: string;
  media_type?: string;
  tags?: string;
  tags_list?: string[];
  uploaded_by?: number;
  uploaded_by_name?: string;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGalleryItem {
  title: string;
  description?: string;
  category: number;
  file?: string | File;
  imageUrl?: string;
  tags?: string;
  is_featured?: boolean;
}

export interface CreateGalleryCategory {
  name: string;
}

// Destination Types
export interface DestinationCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Destination {
  id: number;
  name: string;
  description: string;
  category: DestinationCategory;
  location: string;
  coordinates: string;
  images: string;
  entrance_fee: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDestination {
  name: string;
  description: string;
  category: number;
  location: string;
  coordinates: string;
  images: string;
  entrance_fee: string;
  is_active: boolean;
}

export interface CreateDestinationCategory {
  name: string;
  description: string;
}

// Chatbot Types
export interface ChatbotMessage {
  id?: number;
  userMessage: string;
  botResponse?: string;
  timestamp: string;
}

export interface ChatbotResponse {
  response: string;
  timestamp?: string;
}

export interface ChatbotContent {
  id?: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// Auth Types
export interface User {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  phone_number?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

export interface AuthResponse {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  token: string;
  refresh?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
