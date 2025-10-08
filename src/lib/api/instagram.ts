import axios from 'axios';
import { authService } from './auth';

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

export interface InstagramAnalytics {
  id: number;
  username: string;
  full_name: string;
  follower: number;
  following: number;
  media_count: number;
  total_like: number;
  total_comment: number;
  avg_engagement_rate: number;
  snapshot_date: string;
  created_at: string;
}

export interface InstagramAnalyticsResponse {
  count: number;
  filters: {
    username: string | null;
    month: number | null;
    year: number | null;
    start_date: string | null;
    end_date: string | null;
  };
  data: InstagramAnalytics[];
}

export interface CreateInstagramPost {
  post_type: string;
  caption: string;
  media: File;
  scheduled_at?: string;
  status: string;
  extras?: string;
  session: number;
}

export const getInstagramAnalytics = async (params?: {
  username?: string;
  month?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
}): Promise<InstagramAnalyticsResponse> => {
  const response = await api.get('/instagram/analytics-data/', { params });
  console.log('Instagram Analytics API response:', response.data);
  return response.data;
};

export const createInstagramPost = async (data: CreateInstagramPost) => {
  const formData = new FormData();
  formData.append('post_type', data.post_type);
  formData.append('caption', data.caption);
  formData.append('media', data.media);
  formData.append('status', data.status);
  formData.append('session', data.session.toString());
  
  if (data.scheduled_at) {
    formData.append('scheduled_at', data.scheduled_at);
  }
  
  if (data.extras) {
    formData.append('extras', data.extras);
  }

  const response = await api.post('/instagram/posts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
