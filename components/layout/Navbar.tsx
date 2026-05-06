'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search, User, AlertCircle, Clock } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLeads } from '@/lib/actions/lead.actions';
import { useRealtime } from '@/components/providers/RealtimeProvider';

const Navbar = () => {
  const { data: session } = useSession();
  const { overdue, stale } = useReminders();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { isConnected } = useRealtime();
  
  const totalNotifications = overdue.length + stale.length;

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setIsSearching(true);
    try {
      const allLeads = await getLeads({});
      const filtered = allLeads.filter((lead: any) =>
        lead.name?.toLowerCase().includes(query.toLowerCase()) ||
        lead.email?.toLowerCase().includes(query.toLowerCase()) ||
        lead.phone?.includes(query) ||
        lead.propertyInterest?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
      setShowSearch(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm relative z-40">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            className="h-10 w-64 rounded-full bg-gray-100 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#517561]/30"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />

          {/* Search Results Dropdown */}
          {showSearch && (
            <div className="absolute top-12 left-0 w-80 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((lead: any) => (
                    <button
                      key={lead._id}
                      className="w-full text-left px-4 py-3 hover:bg-[#629c7c]/5 transition-colors border-b border-gray-50 last:border-0"
                      onMouseDown={() => {
                        router.push(`/leads/${lead._id}`);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                    >
                      <p className="text-sm font-bold text-[#262f2a]">{lead.name}</p>
                      <p className="text-xs text-[#3b5d49] mt-0.5">{lead.propertyInterest} • {lead.email}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">No leads found for &quot;{searchQuery}&quot;</div>
              )}
            </div>
          )}
        </div>

        {/* Connection Status Indicator */}
        <div className="flex items-center space-x-1.5">
          <div className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'
          )} />
          <span className="text-[10px] font-medium text-gray-400">
            {isConnected ? 'Live' : 'Polling'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-500 hover:text-gray-700"
          >
            <Bell size={20} />
            {totalNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
              <h4 className="mb-4 font-bold text-gray-900 border-b pb-2">Notifications</h4>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {overdue.length === 0 && stale.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                )}
                
                {overdue.map((item: any) => (
                  <Link 
                    key={item._id} 
                    href={`/leads/${item._id}`}
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start space-x-3 p-2 hover:bg-red-50 rounded-lg transition-colors border-l-4 border-red-500"
                  >
                    <AlertCircle className="text-red-500 mt-1" size={16} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Overdue Follow-up</p>
                      <p className="text-[11px] text-gray-600 line-clamp-1">{item.name} - {item.propertyInterest}</p>
                    </div>
                  </Link>
                ))}

                {stale.map((item: any) => (
                  <Link 
                    key={item._id} 
                    href={`/leads/${item._id}`}
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start space-x-3 p-2 hover:bg-orange-50 rounded-lg transition-colors border-l-4 border-orange-500"
                  >
                    <Clock className="text-orange-500 mt-1" size={16} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Stale Lead</p>
                      <p className="text-[11px] text-gray-600 line-clamp-1">{item.name} - No activity for 3 days</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{session?.user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{session?.user?.role?.toLowerCase()}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#517561]/10 text-[#517561]">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
