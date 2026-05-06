'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getLeads } from '@/lib/actions/lead.actions';
import { useSession } from 'next-auth/react';

/**
 * Custom hook providing real-time lead updates via polling.
 * Polls every `intervalMs` milliseconds and notifies when data changes.
 * This serves as the polling fallback required by the assignment
 * (Socket.io is preferred but polling is the reliable fallback).
 */
export function useRealtimeLeads(intervalMs = 10000) {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const prevCountRef = useRef(0);

  const fetchLeads = useCallback(async () => {
    if (!session?.user) return;

    const query = session.user.role === 'AGENT' ? { assignedTo: session.user.id } : {};
    const data = await getLeads(query);

    // Detect changes
    if (prevCountRef.current > 0 && data.length !== prevCountRef.current) {
      setHasNewUpdates(true);
    }
    prevCountRef.current = data.length;

    setLeads(data);
    setLastUpdated(new Date());
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, intervalMs);
    return () => clearInterval(interval);
  }, [fetchLeads, intervalMs]);

  const dismissUpdates = useCallback(() => setHasNewUpdates(false), []);

  return {
    leads,
    isLoading,
    lastUpdated,
    hasNewUpdates,
    dismissUpdates,
    refresh: fetchLeads,
  };
}
