"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';

interface InstagramSession {
  id: number;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
}

interface InstagramAuthContextType {
  session: InstagramSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const InstagramAuthContext = createContext<InstagramAuthContextType | undefined>(undefined);

export function InstagramAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<InstagramSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const storedSession = localStorage.getItem('instagram_session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
        }
      } catch (error) {
        console.error('Error loading Instagram session:', error);
        localStorage.removeItem('instagram_session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Call the Instagram login API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/instagram/sessions/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login to Instagram');
      }

      const data = await response.json();
      
      // Store session data
      const sessionData: InstagramSession = {
        id: data.data.id,
        username: data.data.username,
        full_name: data.data.full_name,
        profile_picture_url: data.data.profile_picture_url,
        is_active: data.data.is_active,
        created_at: data.data.created_at,
      };

      setSession(sessionData);
      localStorage.setItem('instagram_session', JSON.stringify(sessionData));

      addNotification({
        type: 'success',
        title: 'Instagram Connected',
        message: `Successfully connected to Instagram account @${username}`,
      });
    } catch (error) {
      console.error('Instagram login error:', error);
      addNotification({
        type: 'error',
        title: 'Instagram Login Failed',
        message: error instanceof Error ? error.message : 'Failed to connect to Instagram account',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('instagram_session');
    addNotification({
      type: 'info',
      title: 'Instagram Disconnected',
      message: 'You have been disconnected from your Instagram account',
    });
  };

  return (
    <InstagramAuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </InstagramAuthContext.Provider>
  );
}

export function useInstagramAuth() {
  const context = useContext(InstagramAuthContext);
  if (context === undefined) {
    throw new Error('useInstagramAuth must be used within an InstagramAuthProvider');
  }
  return context;
}
