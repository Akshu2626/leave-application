'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle2, ChevronLeft, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please try again.');
      router.push('/forgot-password');
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyOtp(email, otpCode);
      toast.success('OTP Verified successfully!');

      // Store in session instead of URL params for security
      sessionStorage.setItem('resetEmail', email);
      sessionStorage.setItem('resetOtp', otpCode);

      router.push('/reset-password');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resetPassword(email);
      setTimer(60);
      toast.success('A new OTP has been sent to your email.');
    } catch (error: any) {
      toast.error('Failed to resend OTP. Please try again later.');
    } finally {
      setResending(false);
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
              Verify your identity to secure your account.
            </p>
          </div>
        </div>

        <div className="login-form-wrap">
          <Card className="login-card">
            <CardHeader className="login-card-header">
              <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
              <CardDescription>
                We&apos;ve sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      ref={(el: any) => (inputRefs.current[index] = el)}
                      className="w-10 h-12 text-center text-xl font-bold rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <Button type="submit" className="login-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>

                <div className="text-center text-sm">
                  {timer > 0 ? (
                    <p className="text-muted-foreground">
                      Resend code in <span className="text-primary font-medium">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-primary font-semibold hover:underline flex items-center justify-center mx-auto"
                    >
                      {resending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary flex items-center mx-auto transition-colors">
                <ChevronLeft size={16} className="mr-1" />
                Change Email
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
