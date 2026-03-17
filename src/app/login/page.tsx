'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Clock, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      toast.success('Welcome back!');
      router.push('/dashboard');
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />
      </div>

      <div className="login-content">
        {/* Left side — branding */}
        <div className="login-branding">
          <div className="login-brand-inner">
            <div className="login-logo-row">
              <div className="login-logo-icon">
                <Clock size={28} strokeWidth={2.5} />
              </div>
              <h1 className="login-logo-text">AttendEase</h1>
            </div>
            <p className="login-tagline">
              Smart Attendance & Leave Management for Modern Teams
            </p>
            <div className="login-features">
              <div className="login-feature-item">
                <Clock size={20} />
                <span>One-click Check-In/Out</span>
              </div>
              <div className="login-feature-item">
                <Shield size={20} />
                <span>Secure & Role-based Access</span>
              </div>
              <div className="login-feature-item">
                <Users size={20} />
                <span>Team Overview & Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side — login form */}
        <div className="login-form-wrap">
          <Card className="login-card">
            <CardHeader className="login-card-header">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-field">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="login-field">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : 'Sign In'}
                </Button>
                {/* <div className="login-demo-creds">
                  <p className="text-xs text-muted-foreground font-medium">Demo accounts:</p>
                  <div className="login-demo-grid">
                    <button type="button" className="login-demo-btn" onClick={() => { setEmail('akshu@company.com'); setPassword('password123'); }}>
                      <span className="login-demo-role">Employee</span>
                      <span className="login-demo-email">akshu@company.com</span>
                    </button>
                    <button type="button" className="login-demo-btn" onClick={() => { setEmail('rahul@company.com'); setPassword('password123'); }}>
                      <span className="login-demo-role">Manager</span>
                      <span className="login-demo-email">rahul@company.com</span>
                    </button>
                    <button type="button" className="login-demo-btn" onClick={() => { setEmail('priya@company.com'); setPassword('password123'); }}>
                      <span className="login-demo-role">Admin</span>
                      <span className="login-demo-email">priya@company.com</span>
                    </button>
                  </div>
                </div> */}
              </form>
              <div className="text-sm text-center text-muted-foreground mt-4 space-y-2">
                <div>
                  <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                    Forgot Password?
                  </Link>
                </div>
                <div>
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-primary font-semibold hover:underline">
                    Sign Up
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
