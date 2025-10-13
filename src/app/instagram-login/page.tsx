"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Instagram, Loader2 } from 'lucide-react';
import { useInstagramAuth } from '@/contexts/InstagramAuthContext';
import Link from 'next/link';

export default function InstagramLoginPage() {
  const router = useRouter();
  const { login, loading } = useInstagramAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.username, formData.password);
      // Redirect to the page they came from or default to analytics
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/socmed-analytics';
      router.push(returnUrl);
    } catch (error) {
      // Error handling is done in the context
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          href="/socmed-analytics"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl mb-4">
              <Instagram className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Connect Instagram Account</h1>
            <p className="text-sm text-gray-600 mt-2">
              Login to your Instagram account to manage posts and view analytics
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Instagram Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your_username"
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Instagram className="mr-2 h-4 w-4" />
                  Connect Instagram
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center mt-4">
              <p>Your credentials are securely stored and used only for managing your Instagram content.</p>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Need help? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
