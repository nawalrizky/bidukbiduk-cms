"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Instagram, Loader2, Shield, Mail } from 'lucide-react';
import { useInstagramAuth } from '@/contexts/InstagramAuthContext';
import Link from 'next/link';

type LoginStep = 'credentials' | 'challenge';

export default function InstagramLoginPage() {
  const router = useRouter();
  const { login, checkChallengeStatus, submitChallenge, loading } = useInstagramAuth();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [challengeInfo, setChallengeInfo] = useState<{
    has_active_challenge: boolean;
    challenge_info?: {
      choice: number;
      username: string;
    };
    message?: string;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [loginStage, setLoginStage] = useState<'idle' | 'logging-in' | 'checking-challenge'>('idle');

  const checkStatus = async () => {
    if (!formData.username) return;
    
    try {
      setCheckingStatus(true);
      const status = await checkChallengeStatus(formData.username);
      console.log('Challenge status update:', status);
      
      if (status.has_active_challenge) {
        setChallengeInfo(status);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Poll for challenge status when in challenge step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'challenge' && formData.username) {
      // Check immediately
      checkStatus();
      
      // Then check every 5 seconds
      interval = setInterval(() => {
        checkStatus();
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, formData.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoginStage('logging-in');
      const result = await login(formData.username, formData.password);
      
      // After login, check if challenge is needed
      setLoginStage('checking-challenge');
      
      if (result.needsChallenge) {
        // Show challenge step
        setStep('challenge');
        setChallengeInfo(result.challengeInfo || null);
        setLoginStage('idle');
      } else {
        // Success - redirect
        setLoginStage('idle');
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/socmed-analytics';
        router.push(returnUrl);
      }
    } catch (error) {
      setLoginStage('idle');
      // Error handling is done in the context
      console.error('Login failed:', error);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitChallenge(formData.username, verificationCode);
      // Success - redirect
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/socmed-analytics';
      router.push(returnUrl);
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  if (step === 'challenge') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => setStep('credentials')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>

          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verification Required</h1>
              <p className="text-sm text-gray-600 mt-2">
                Instagram has sent a verification code to your email
              </p>
            </div>

            {challengeInfo?.challenge_info && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  📧 Check your email for the verification code
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Account:</strong> {challengeInfo.challenge_info.username}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Instagram has sent a verification code to the email associated with this account.
                </p>
              </div>
            )}

            {challengeInfo?.message && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  {challengeInfo.message}
                </p>
              </div>
            )}

            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  disabled={loading}
                  className="mt-1 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the code sent to your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Code
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={checkStatus}
                  disabled={checkingStatus}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {checkingStatus ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Checking status...
                    </>
                  ) : (
                    'Check Status Manually'
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Status is automatically checked every 5 seconds
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-gray-600 text-center">
                  💡 <strong>Note:</strong> The login process may take a few moments as Instagram verifies your credentials and sends the verification code.
                </p>
              </div>
            </form>
          </Card>

          <p className="text-center text-sm text-gray-600 mt-6">
            Didn&apos;t receive the code? Check your spam folder or try logging in again.
          </p>
        </div>
      </div>
    );
  }

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
              disabled={loading || loginStage !== 'idle'}
            >
              {loginStage === 'logging-in' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : loginStage === 'checking-challenge' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking verification status...
                </>
              ) : (
                <>
                  <Instagram className="mr-2 h-4 w-4" />
                  Connect Instagram
                </>
              )}
            </Button>

            {loginStage === 'checking-challenge' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center mb-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <p className="text-sm font-medium text-blue-800">
                    Checking verification status...
                  </p>
                </div>
                <p className="text-xs text-blue-600 text-center">
                  We&apos;re checking if Instagram requires email verification for your account
                </p>
              </div>
            )}

            {loginStage === 'logging-in' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-purple-800 text-center">
                  📤 Submitting your credentials to Instagram...
                </p>
              </div>
            )}

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
