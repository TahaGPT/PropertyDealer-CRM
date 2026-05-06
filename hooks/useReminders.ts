'use client';

import { useState, useEffect } from 'react';
import { getReminders } from '@/lib/actions/reminder.actions';
import { useSession } from 'next-auth/react';

export function useReminders() {
  const { data: session } = useSession();
  const [reminders, setReminders] = useState({ overdue: [], stale: [] });

  useEffect(() => {
    if (!session?.user) return;

    const fetchReminders = async () => {
      const data = await getReminders(session.user.id, session.user.role);
      setReminders(data);
    };

    fetchReminders();
    const interval = setInterval(fetchReminders, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [session]);

  return reminders;
}
