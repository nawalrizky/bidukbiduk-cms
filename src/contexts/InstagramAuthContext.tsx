"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications } from './NotificationContext';
import { authService } from '@/lib/api/auth';
import { deleteInstagramSession } from '@/lib/api/instagram';

interface InstagramSession {
  id: number;
  name: string;
  instagram_username: string;
  session: {
    uuids: {
      phone_id: string;
      uuid: string;
      client_session_id: string;
      advertising_id: string;
      android_device_id: string;
      request_id: string;
      tray_session_id: string;
    };
    mid: string;
    ig_u_rur: string | null;
    ig_www_claim: string | null;
    authorization_data: {
      ds_user_id: string;
      sessionid: string;
    };
    cookies: Record<string, unknown>;
    last_login: number;
    device_settings: {
      app_version: string;
      android_version: number;
      android_release: string;
      dpi: string;
      resolution: string;
      manufacturer: string;
      device: string;
      model: string;
      cpu: string;
      version_code: string;
    };
    user_agent: string;
    country: string;
    country_code: number;
    locale: string;
    timezone_offset: number;
  };
  created_at: string;
  updated_at: string;
}

interface ChallengeInfo {
  has_active_challenge: boolean;
  challenge_info?: {
    choice: number;
    username: string;
  };
  message?: string;
}

interface InstagramAuthContextType {
  session: InstagramSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ needsChallenge: boolean; challengeInfo?: ChallengeInfo }>;
  checkChallengeStatus: (username: string) => Promise<ChallengeInfo>;
  submitChallenge: (username: string, code: string) => Promise<void>;
  fetchExistingSession: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const InstagramAuthContext = createContext<InstagramAuthContextType | undefined>(undefined);

export function InstagramAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<InstagramSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Fetch existing session from backend
  const fetchExistingSession = useCallback(async () => {
    try {
      const token = authService.getAccessToken();
      
      if (!token) {
        console.log('No CMS token found, skipping Instagram session fetch');
        return;
      }

      console.log('Fetching existing Instagram session from backend...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/instagram/session/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Existing Instagram session found:', data);

        const sessionData: InstagramSession = {
          id: data.id,
          name: data.name,
          instagram_username: data.instagram_username,
          session: data.session,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setSession(sessionData);
        localStorage.setItem('instagram_session', JSON.stringify(sessionData));

        addNotification({
          type: 'success',
          title: 'Instagram Session Restored',
          message: `Connected to Instagram account @${data.instagram_username}`,
        });
      } else if (response.status === 404) {
        console.log('No existing Instagram session found');
        // Clear localStorage if backend has no session
        localStorage.removeItem('instagram_session');
        setSession(null);
      } else {
        console.error('Failed to fetch Instagram session:', response.status);
      }
    } catch (error) {
      console.error('Error fetching Instagram session:', error);
    }
  }, [addNotification]);

  // Load session on mount - check localStorage first, then backend
  useEffect(() => {
    const loadSession = async () => {
      try {
        // First, try to load from localStorage for instant UI
        const storedSession = localStorage.getItem('instagram_session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          console.log('Loaded Instagram session from localStorage');
        }

        // Then, fetch from backend to sync with server
        await fetchExistingSession();
      } catch (error) {
        console.error('Error loading Instagram session:', error);
        localStorage.removeItem('instagram_session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Get the CMS authentication token using authService
      const token = authService.getAccessToken();
      
      console.log('Instagram login attempt:');
      console.log('- Username:', username);
      console.log('- CMS Token present:', !!token);
      console.log('- API URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/instagram/login/`);
      
      if (!token) {
        throw new Error('You must be logged into the CMS first');
      }
      
      // Show notification that this may take time
      addNotification({
        type: 'info',
        title: 'Connecting to Instagram',
        message: 'Submitting credentials...',
      });
      
      // Call the Instagram login API endpoint (fire and forget, may timeout)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/instagram/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        console.log('Instagram login response:', data);
        
        // If we get immediate success without challenge
        if (response.ok && data && !data.has_active_challenge) {
          const sessionData: InstagramSession = {
            id: data.id,
            name: data.name,
            instagram_username: data.instagram_username,
            session: data.session,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };

          setSession(sessionData);
          localStorage.setItem('instagram_session', JSON.stringify(sessionData));

          addNotification({
            type: 'success',
            title: 'Instagram Connected',
            message: `Successfully connected to Instagram account @${data.instagram_username}`,
          });

          return { needsChallenge: false };
        }
      } catch (fetchError) {
        // Login request failed or timed out - this is expected
        console.log('Login request timed out or failed (expected):', fetchError);
      }
      
      // Wait a moment then check challenge status
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Now check if challenge was created
      console.log('Checking challenge status...');
      const challengeStatus = await checkChallengeStatus(username);
      console.log('Challenge status:', challengeStatus);
      
      if (challengeStatus.has_active_challenge) {
        addNotification({
          type: 'info',
          title: 'Verification Required',
          message: 'Please check your email for the verification code',
        });
        
        return {
          needsChallenge: true,
          challengeInfo: challengeStatus
        };
      }
      
      // No challenge found - might be an error
      throw new Error('Unable to verify login status. Please try again.');
      
    } catch (error) {
      console.error('Instagram login error:', error);
      
      // Don't show error notification if it's a challenge scenario
      if (!(error instanceof Error && error.message.includes('needsChallenge'))) {
        addNotification({
          type: 'error',
          title: 'Instagram Login Failed',
          message: error instanceof Error ? error.message : 'Failed to connect to Instagram account',
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkChallengeStatus = async (username: string): Promise<ChallengeInfo> => {
    const token = authService.getAccessToken();
    
    if (!token) {
      throw new Error('You must be logged into the CMS first');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/instagram/challenge-status/${username}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    const data = await response.json();
    console.log('Challenge status:', data);
    
    return data;
  };

  const submitChallenge = async (username: string, code: string) => {
    try {
      setLoading(true);
      
      const token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('You must be logged into the CMS first');
      }

      console.log('Submitting challenge with:', { username, challenge_code: code });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/instagram/submit-challenge/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ 
          username, 
          challenge_code: code 
        }),
      });

      const data = await response.json();
      console.log('Challenge submission response:', data);

      if (!response.ok) {
        const errorMessage = data.detail || data.message || data.error || 'Failed to submit verification code';
        throw new Error(errorMessage);
      }

      // If successful, store full session data
      if (data) {
        const sessionData: InstagramSession = {
          id: data.id,
          name: data.name,
          instagram_username: data.instagram_username,
          session: data.session,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setSession(sessionData);
        localStorage.setItem('instagram_session', JSON.stringify(sessionData));

        addNotification({
          type: 'success',
          title: 'Instagram Connected',
          message: `Successfully connected to Instagram account @${data.instagram_username}`,
        });
      }
    } catch (error) {
      console.error('Challenge submission error:', error);
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: error instanceof Error ? error.message : 'Failed to submit verification code',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (session) {
        // Delete session from backend using API function
        await deleteInstagramSession();
        console.log('Instagram session deleted from backend');
      }
    } catch (error) {
      console.error('Error deleting Instagram session:', error);
      // Continue with logout even if backend deletion fails
    } finally {
      // Always clear local session
      setSession(null);
      localStorage.removeItem('instagram_session');
      addNotification({
        type: 'info',
        title: 'Instagram Disconnected',
        message: 'You have been disconnected from your Instagram account',
      });
    }
  };

  return (
    <InstagramAuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        login,
        checkChallengeStatus,
        submitChallenge,
        fetchExistingSession,
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
