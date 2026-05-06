'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { FadeIn } from '@/components/ui/animations';
import Link from 'next/link';
import { LayoutDashboard, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#262f2a] px-4">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[#517561] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-[#629c7c] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#3b5d49] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <FadeIn>
        <Card className="w-full max-w-md border-[#324b3a]/50 bg-[#324b3a]/30 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#517561] shadow-lg shadow-[#517561]/30">
              <LayoutDashboard className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Welcome Back</h1>
            <p className="mt-2 text-[#629c7c] font-semibold">Login to manage your property leads</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/20 border border-red-500/40 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#629c7c]" size={18} />
                <Input
                  type="email"
                  placeholder="admin@estatecrm.com"
                  className="pl-11 border-[#262f2a] bg-[#262f2a] placeholder:text-white/30 focus:border-[#517561]"
                  style={{ color: 'white' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#629c7c]" size={18} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 border-[#262f2a] bg-[#262f2a] placeholder:text-white/30 focus:border-[#517561]"
                  style={{ color: 'white' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="h-12 w-full rounded-xl bg-[#517561] text-base font-bold text-white hover:bg-[#629c7c] shadow-lg shadow-[#517561]/20 transition-all" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-white/60">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-[#629c7c] hover:text-white transition-colors">
              Sign up
            </Link>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
