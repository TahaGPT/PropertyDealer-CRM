'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export type LeadEvent = {
  type: 'LEAD_CREATED' | 'LEAD_UPDATED' | 'LEAD_ASSIGNED' | 'LEAD_DELETED' | 'LEAD_STATUS_CHANGED';
  leadId: string;
  leadName: string;
  details: string;
  timestamp: string;
  assignedTo?: string;
};

/**
 * Hook for real-time lead updates using Socket.io with polling fallback.
 * Socket.io is preferred for bidirectional real-time updates.
 * Falls back to periodic polling when WebSockets are unavailable.
 */
export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Attempt Socket.io connection
    const socket = io({
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'], // Start with polling, upgrade to WS
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket.id);
      setIsConnected(true);

      // Join room based on user role
      socket.emit('join', {
        userId: session.user.id,
        role: session.user.role,
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      // Socket.io unavailable — polling fallback is active via useRealtimeLeads
      setIsConnected(false);
    });

    // Listen for lead update events
    socket.on('lead-update', (event: LeadEvent) => {
      console.log('[Socket.io] Received event:', event);
      setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 events
      setHasNewUpdates(true);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session]);

  const dismissUpdates = useCallback(() => {
    setHasNewUpdates(false);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setHasNewUpdates(false);
  }, []);

  return {
    isConnected,
    events,
    hasNewUpdates,
    dismissUpdates,
    clearEvents,
  };
}
