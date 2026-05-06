'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: isAdmin ? '/admin' : '/dashboard' },
    { name: 'Leads', icon: Users, href: '/leads' },
    { name: 'Analytics', icon: TrendingUp, href: '/admin/analytics', adminOnly: true },
    { name: 'Agents', icon: UserCheck, href: '/admin/agents', adminOnly: true },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-[#262f2a] text-white relative overflow-hidden border-r border-[#324b3a]">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#629c7c]/10 rounded-full blur-3xl" />
      
      <div className="flex h-24 items-center px-8 relative">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-[#517561] rounded-xl flex items-center justify-center shadow-lg shadow-[#517561]/30">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Estate<span className="text-[#629c7c]">CRM</span></span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 relative">
        {menuItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-300',
                isActive 
                  ? 'bg-[#517561] text-white shadow-lg shadow-[#517561]/20' 
                  : 'text-[#629c7c]/60 hover:bg-[#324b3a] hover:text-[#f4f7f5]'
              )}
            >
              <item.icon size={20} className={cn('transition-transform duration-300 group-hover:scale-110', isActive ? 'text-white' : 'text-[#629c7c]/40 group-hover:text-[#629c7c]')} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 relative">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
