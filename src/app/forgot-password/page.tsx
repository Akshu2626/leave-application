'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Send, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email);
      toast.success('Verification code sent to your email');
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset link. Please try again.');
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
              Reset your password to regain access to your account.
            </p>
          </div>
        </div>

        <div className="login-form-wrap">
          <Card className="login-card">
            <CardHeader className="login-card-header">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>
                {isSent
                  ? "We've sent a recovery link to your email."
                  : "Enter your email address and we'll send you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSent ? (
                <form onSubmit={handleSubmit} className="login-form">
                  <div className="login-field">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Button type="submit" className="login-submit-btn" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={24} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Check your inbox for <b>{email}</b>. If you don&apos;t see it, check your spam folder.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                    Try another email
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center mx-auto transition-colors">
                <ChevronLeft size={16} className="mr-1" />
                Back to Login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
