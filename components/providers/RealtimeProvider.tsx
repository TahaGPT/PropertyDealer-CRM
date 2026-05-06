'use client';

import { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToasts, ToastContainer } from '@/components/ui/Toast';
import { getLeads } from '@/lib/actions/lead.actions';
import { useSession } from 'next-auth/react';

type RealtimeContextType = {
  isConnected: boolean;
  refreshLeads: () => void;
};

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  refreshLeads: () => {},
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

/**
 * Provider that combines Socket.io real-time events with polling fallback.
 * Shows toast notifications when lead events occur.
 * Wraps the dashboard layout to provide real-time updates globally.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isConnected, events, hasNewUpdates, dismissUpdates } = useSocket();
  const { toasts, addToast, dismissToast } = useToasts();
  const prevEventsLenRef = useRef(0);

  // Show toast notifications for new socket events
  useEffect(() => {
    if (events.length > prevEventsLenRef.current) {
      const newEvents = events.slice(0, events.length - prevEventsLenRef.current);
      
      newEvents.forEach((event) => {
        const titles: Record<string, string> = {
          LEAD_CREATED: '🆕 New Lead Created',
          LEAD_UPDATED: '📝 Lead Updated',
          LEAD_ASSIGNED: '👤 Lead Assigned',
          LEAD_DELETED: '🗑️ Lead Deleted',
          LEAD_STATUS_CHANGED: '🔄 Status Changed',
        };

        addToast({
          type: event.type,
          title: titles[event.type] || 'Lead Update',
          message: `${event.leadName}: ${event.details}`,
        });
      });
    }
    prevEventsLenRef.current = events.length;
  }, [events]);

  // Polling fallback: check for updates every 15 seconds
  useEffect(() => {
    if (!session?.user || isConnected) return; // Skip polling if Socket.io is connected

    const pollInterval = setInterval(async () => {
      // The leads page and dashboard already poll individually,
      // but this ensures background polling for notifications
      try {
        const query = session.user.role === 'AGENT' ? { assignedTo: session.user.id } : {};
        await getLeads(query); // Triggers revalidation
      } catch (err) {
        // Silently fail - polling is a best-effort fallback
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [session, isConnected]);

  const refreshLeads = useCallback(() => {
    dismissUpdates();
  }, [dismissUpdates]);

  return (
    <RealtimeContext.Provider value={{ isConnected, refreshLeads }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </RealtimeContext.Provider>
  );
}
