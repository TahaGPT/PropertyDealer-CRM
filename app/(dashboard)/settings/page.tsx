'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui';
import { FadeIn } from '@/components/ui/animations';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-black text-[#262f2a] tracking-tight">Settings</h1>
          <p className="text-[#3b5d49] mt-1 font-semibold">Your account information</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="p-8">
          <h3 className="text-lg font-bold text-[#262f2a] mb-6">Profile</h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-[#f4f7f5] rounded-xl">
              <div className="p-2.5 bg-[#517561]/10 rounded-xl text-[#517561]">
                <User size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#517561]">Name</p>
                <p className="text-sm font-bold text-[#262f2a] mt-0.5">{session?.user?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-[#f4f7f5] rounded-xl">
              <div className="p-2.5 bg-[#517561]/10 rounded-xl text-[#517561]">
                <Mail size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#517561]">Email</p>
                <p className="text-sm font-bold text-[#262f2a] mt-0.5">{session?.user?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-[#f4f7f5] rounded-xl">
              <div className="p-2.5 bg-[#517561]/10 rounded-xl text-[#517561]">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#517561]">Role</p>
                <p className="text-sm font-bold text-[#262f2a] mt-0.5">{session?.user?.role || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
