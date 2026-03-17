'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Lock, ShieldCheck, ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    const storedOtp = sessionStorage.getItem('resetOtp');
    
    if (!storedEmail || !storedOtp) {
      toast.error('Invalid reset session. Please start over.');
      router.push('/forgot-password');
      return;
    }
    
    setEmail(storedEmail);
    setOtp(storedOtp);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.updatePassword(email, otp, password, confirmPassword);
      setIsSuccess(true);
      
      // Clear session
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetOtp');
      
      toast.success('Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />
      </div>

      <div className="login-content">
        <div className="login-branding">
          <div className="login-brand-inner">
            <div className="login-logo-row">
              <div className="login-logo-icon">
                <Clock size={28} strokeWidth={2.5} />
              </div>
              <h1 className="login-logo-text">AttendEase</h1>
            </div>
            <p className="login-tagline">
              Create a strong new password to protect your account.
            </p>
          </div>
        </div>

        <div className="login-form-wrap">
          <Card className="login-card">
            <CardHeader className="login-card-header">
              <CardTitle className="text-2xl font-bold">New Password</CardTitle>
              <CardDescription>
                Set your new secure password below to finish the recovery process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="login-field">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="login-field">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="login-submit-btn" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="bg-emerald-500/10 text-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Success!</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your password has been reset successfully. Redirecting you to login...
                  </p>
                  <Button className="w-full" onClick={() => router.push('/login')}>
                    Go to Login Now
                  </Button>
                </div>
              )}
            </CardContent>
            {!isSuccess && (
              <CardFooter>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center mx-auto transition-colors">
                  <ChevronLeft size={16} className="mr-1" />
                  Cancel and Return
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
