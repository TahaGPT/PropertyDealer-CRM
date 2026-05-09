'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search, User, AlertCircle, Clock, UserPlus, UserMinus, Users, MailWarning, CheckCheck } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLeads } from '@/lib/actions/lead.actions';
import { useRealtime } from '@/components/providers/RealtimeProvider';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notification.actions';

const NOTIFICATION_ICONS: Record<string, any> = {
  LEAD_CREATED: { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-500' },
  CLIENT_ASSIGNED: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500' },
  CUSTOMER_DELETED: { icon: UserMinus, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-500' },
  AGENT_CREATED: { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-500' },
  EMAIL_FAILED: { icon: MailWarning, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-500' },
};

const Navbar = () => {
  const { data: session } = useSession();
  const { overdue, stale } = useReminders();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'reminders' | 'notifications'>('notifications');
  const router = useRouter();
  const { isConnected } = useRealtime();
  
  const isAdmin = session?.user?.role === 'ADMIN';

  // Fetch admin notifications
  useEffect(() => {
    if (!session?.user?.id || !isAdmin) return;

    const fetchNotifications = async () => {
      const notifs = await getNotifications(session.user.id);
      setAdminNotifications(notifs);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [session, isAdmin]);

  const unreadCount = adminNotifications.filter((n: any) => !n.read).length;
  const totalNotifications = overdue.length + stale.length + unreadCount;

  const handleMarkAllRead = async () => {
    if (!session?.user?.id) return;
    await markAllNotificationsRead(session.user.id);
    setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setAdminNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
  };

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

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

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
            className="relative text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Bell size={20} />
            {totalNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                {totalNotifications > 99 ? '99+' : totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              {/* Header with tabs */}
              <div className="border-b border-gray-100">
                <div className="flex items-center justify-between px-4 pt-3 pb-0">
                  <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                  {isAdmin && unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#517561] hover:text-[#3b5d49] font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <CheckCheck size={12} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="flex px-4 mt-2">
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={cn(
                        'flex-1 text-xs font-semibold py-2 border-b-2 transition-colors',
                        activeTab === 'notifications'
                          ? 'border-[#517561] text-[#517561]'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      )}
                    >
                      Activity {unreadCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('reminders')}
                      className={cn(
                        'flex-1 text-xs font-semibold py-2 border-b-2 transition-colors',
                        activeTab === 'reminders'
                          ? 'border-[#517561] text-[#517561]'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      )}
                    >
                      Reminders {(overdue.length + stale.length) > 0 && (
                        <span className="ml-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {overdue.length + stale.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {/* Admin Activity Notifications Tab */}
                {(isAdmin && activeTab === 'notifications') ? (
                  adminNotifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {adminNotifications.slice(0, 20).map((notif: any) => {
                        const config = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.LEAD_CREATED;
                        const IconComponent = config.icon;
                        return (
                          <button
                            key={notif._id}
                            onClick={() => handleMarkRead(notif._id)}
                            className={cn(
                              'w-full text-left px-4 py-3 transition-colors flex items-start space-x-3',
                              !notif.read ? 'bg-[#517561]/[0.03]' : 'hover:bg-gray-50'
                            )}
                          >
                            <div className={cn('mt-0.5 p-1.5 rounded-lg', config.bg)}>
                              <IconComponent size={14} className={config.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={cn(
                                  'text-xs line-clamp-1',
                                  !notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'
                                )}>
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="ml-2 h-2 w-2 rounded-full bg-[#517561] flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  /* Reminders Tab (or non-admin default) */
                  <div className="p-3 space-y-2">
                    {overdue.length === 0 && stale.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">No reminders</p>
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
                )}
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
