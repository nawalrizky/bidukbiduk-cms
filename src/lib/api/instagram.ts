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

export interface InstagramMediaItem {
  url: string;
  type: string;
}

export interface InstagramExtras {
  last_response?: {
    time: string;
    data: {
      thumbnail_url?: string;
      image_versions2?: {
        candidates: Array<{
          url: string;
          width: number;
          height: number;
        }>;
      };
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

export interface InstagramPost {
  id: number;
  post_type: string;
  caption: string;
  media: InstagramMediaItem[] | string; // Can be array or string
  scheduled_at: string | null;
  status: string;
  extras: InstagramExtras | string | null;
  session: number;
  created_at: string;
  updated_at: string;
}

export interface InstagramPostsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InstagramPost[];
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
  if (!data.session) {
    throw new Error('Instagram session ID is required');
  }

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

export const getInstagramPosts = async (params?: {
  page?: number;
  page_size?: number;
}): Promise<InstagramPostsResponse> => {
  const response = await api.get('/instagram/posts/', { params });
  return response.data;
};

export const getInstagramPost = async (id: number): Promise<InstagramPost> => {
  const response = await api.get(`/instagram/posts/${id}/`);
  return response.data;
};

export const updateInstagramPost = async (id: number, data: Partial<CreateInstagramPost>) => {
  const formData = new FormData();
  
  if (data.post_type) formData.append('post_type', data.post_type);
  if (data.caption) formData.append('caption', data.caption);
  if (data.media) formData.append('media', data.media);
  if (data.status) formData.append('status', data.status);
  if (data.session !== undefined) formData.append('session', data.session.toString());
  if (data.scheduled_at) formData.append('scheduled_at', data.scheduled_at);
  if (data.extras) formData.append('extras', data.extras);

  const response = await api.patch(`/instagram/posts/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const deleteInstagramPost = async (id: number): Promise<void> => {
  await api.delete(`/instagram/posts/${id}/`);
};

// Instagram Session Management
export const getInstagramSession = async (): Promise<InstagramSession> => {
  const response = await api.get('/instagram/session/');
  return response.data;
};

export const deleteInstagramSession = async (): Promise<void> => {
  await api.delete('/instagram/session/');
};

interface InstagramSession {
  id: number;
  name: string;
  instagram_username: string;
  session: {
    authorization_data: {
      ds_user_id: string;
      sessionid: string;
    };
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}
