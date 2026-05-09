'use server';

import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

/**
 * Fetches notifications for a specific user (admin).
 * Returns the most recent 50 notifications.
 */
export async function getNotifications(userId: string) {
  try {
    await dbConnect();
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    console.error('[GET NOTIFICATIONS ERROR]', error);
    return [];
  }
}

/**
 * Gets the count of unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    await dbConnect();
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
  } catch (error) {
    console.error('[UNREAD COUNT ERROR]', error);
    return 0;
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationRead(notificationId: string) {
  try {
    await dbConnect();
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    return { success: true };
  } catch (error) {
    console.error('[MARK READ ERROR]', error);
    return { success: false };
  }
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsRead(userId: string) {
  try {
    await dbConnect();
    await Notification.updateMany({ userId, read: false }, { read: true });
    return { success: true };
  } catch (error) {
    console.error('[MARK ALL READ ERROR]', error);
    return { success: false };
  }
}
