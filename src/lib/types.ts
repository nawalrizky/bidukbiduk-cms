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
  category_id: number;
  location: string;
  latitude: string;
  longitude: string;
  images: string;
  facilities: string;
  operating_hours: string;
  entrance_fee: string;
  contact_info: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDestination {
  name: string;
  description: string;
  category_id: number;
  location: string;
  latitude: string;
  longitude: string;
  images?: string | File[];
  operating_hours: string;
  entrance_fee: string;
  contact_info: string;
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
  reply: string;
  session_id: string;
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
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    current_page: number;
    total_pages: number;
  };
}

// Package types
export interface Package {
  package_id: number;
  name: string;
  price: string;
  description?: string;
  image?: string;
  image_url: string;
  is_active: boolean;
  ratings?: PackageRating[];
  total_rating: number;
  total_rating_users: number;
  destinations?: PackageDestination[];
  created_at?: string;
  updated_at?: string;
}

export interface PackageDestination {
  id: number;
  name: string;
  location: string;
  description: string;
}

export interface CreatePackage {
  name: string;
  price: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  total_rating?: number;
  total_rating_users?: number;
  destinations?: number[]; // Array of destination IDs
}

export interface UpdatePackage extends CreatePackage {
  package_id?: number;
}

export interface PackageRating {
  id: number;
  package_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageRating {
  package_id: number;
  rating: number;
  comment?: string;
}

export interface UpdatePackageRating {
  rating: number;
  comment?: string;
}

export interface PackageStats {
  total_packages: number;
  active_packages: number;
  inactive_packages: number;
  average_price: string;
  total_destinations: number;
  total_ratings: number;
  average_rating: number;
}

// Hotel Types
export interface Hotel {
  hotel_id: number;
  name: string;
  price: string;
  description?: string;
  image_url?: string;
  image?: string;
  images?: Array<{
    id: number;
    image_url: string;
    created_at: string;
  }> | string[];
  book_url?: string;
  maps_url?: string;
  is_active: boolean;
  total_rating: number;
  total_rating_users: number;
  ratings?: HotelRating[];
  created_at: string;
  updated_at?: string;
}

export interface CreateHotel {
  name: string;
  description?: string;
  price: string;
  book_url?: string;
  maps_url?: string;
  total_rating?: number;
  total_rating_users?: number;
  image?: File;
  images?: File[];
  is_active?: boolean;
}

export interface UpdateHotel extends CreateHotel {
  hotel_id?: number;
}

export interface HotelRating {
  id: number;
  hotel_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHotelRating {
  hotel_id: number;
  rating: number;
  comment?: string;
}

export interface UpdateHotelRating {
  rating: number;
  comment?: string;
}

export interface HotelStats {
  total_hotels: number;
  active_hotels: number;
  inactive_hotels: number;
  average_price: string;
  total_ratings: number;
  average_rating: number;
}

// Article/News Types
export interface Article {
  id: number;
  title: string;
  content: string;
  featured_image?: string;
  featured_image_url: string;
  category: number;
  category_name?: string;
  tags?: string;
  tags_list?: string[];
  status: 'draft' | 'published' | 'archived';
  publish_date?: string;
  author: number;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateArticle {
  title: string;
  content: string;
  featured_image?: File;
  category: number;
  tags?: string;
  status?: 'draft' | 'published' | 'archived';
  publish_date?: string;
}

export interface UpdateArticle extends CreateArticle {
  id?: number;
}

export interface ArticleCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateArticleCategory {
  name: string;
  description?: string;
}
