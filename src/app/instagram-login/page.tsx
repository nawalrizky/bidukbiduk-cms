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
            Kembali ke Login
          </Button>

          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verifikasi Diperlukan</h1>
              <p className="text-sm text-gray-600 mt-2">
                Instagram telah mengirim kode verifikasi ke email Anda
              </p>
            </div>

            {challengeInfo?.challenge_info && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  📧 Periksa email Anda untuk kode verifikasi
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Akun:</strong> {challengeInfo.challenge_info.username}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Instagram telah mengirim kode verifikasi ke email yang terhubung dengan akun ini.
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
                <Label htmlFor="code">Kode Verifikasi</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Masukkan kode 6 digit"
                  required
                  disabled={loading}
                  className="mt-1 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Masukkan kode yang dikirim ke email Anda
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
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verifikasi Kode
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
                      Memeriksa status...
                    </>
                  ) : (
                    'Periksa Status Secara Manual'
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Status diperiksa secara otomatis setiap 5 detik
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-gray-600 text-center">
                  💡 <strong>Catatan:</strong> Proses login mungkin memakan waktu beberapa saat karena Instagram memverifikasi kredensial Anda dan mengirim kode verifikasi.
                </p>
              </div>
            </form>
          </Card>

          <p className="text-center text-sm text-gray-600 mt-6">
            Tidak menerima kode? Periksa folder spam Anda atau coba masuk lagi.
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
          Kembali ke Dashboard
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl mb-4">
              <Instagram className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hubungkan Akun Instagram</h1>
            <p className="text-sm text-gray-600 mt-2">
              Masuk ke akun Instagram Anda untuk mengelola postingan dan melihat analitik
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Username Instagram</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="nama_pengguna_anda"
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Kata Sandi</Label>
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
                  Masuk...
                </>
              ) : loginStage === 'checking-challenge' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memeriksa status verifikasi...
                </>
              ) : (
                <>
                  <Instagram className="mr-2 h-4 w-4" />
                  Masuk 
                </>
              )}
            </Button>

            {loginStage === 'checking-challenge' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center mb-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <p className="text-sm font-medium text-blue-800">
                    Memeriksa status verifikasi...
                  </p>
                </div>
                <p className="text-xs text-blue-600 text-center">
                  Kami sedang memeriksa apakah Instagram memerlukan verifikasi email untuk akun Anda
                </p>
              </div>
            )}

            {loginStage === 'logging-in' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-purple-800 text-center">
                  📤 Mengirim kredensial Anda ke Instagram...
                </p>
              </div>
            )}

            
          </form>
        </Card>

      
      </div>
    </div>
  );
}
