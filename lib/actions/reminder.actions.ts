'use server';

import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function getReminders(userId: string, role: string) {
  try {
    await dbConnect();
    const now = new Date();
    
    const query: any = role === 'AGENT' ? { assignedTo: userId } : {};
    
    // Overdue follow-ups
    const overdue = await Lead.find({
      ...query,
      followUpDate: { $lt: now },
      status: { $ne: 'CLOSED' }
    }).select('name propertyInterest followUpDate');

    // Stale leads (no update for more than 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const stale = await Lead.find({
      ...query,
      updatedAt: { $lt: threeDaysAgo },
      status: { $in: ['NEW', 'CONTACTED', 'FOLLOW_UP'] }
    }).select('name propertyInterest updatedAt');

    return { overdue: JSON.parse(JSON.stringify(overdue)), stale: JSON.parse(JSON.stringify(stale)) };
  } catch (error) {
    return { overdue: [], stale: [] };
  }
}
