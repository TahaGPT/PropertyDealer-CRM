'use server';

import dbConnect from '@/lib/mongodb';
import { sendEmail, isValidEmail } from '@/lib/email';
import { generateEmailHtml } from '@/lib/constants/email-templates';
import User from '@/models/User';
import Notification from '@/models/Notification';

/**
 * Finds all admin users and returns their IDs and emails.
 */
async function getAdmins(): Promise<{ _id: string; email: string; name: string }[]> {
  await dbConnect();
  const admins = await User.find({ role: 'ADMIN' }).select('_id email name').lean();
  return admins.map((a: any) => ({
    _id: a._id.toString(),
    email: a.email,
    name: a.name,
  }));
}

/**
 * Creates an in-app notification for the admin.
 */
async function createAdminNotification(
  adminId: string,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, any>
) {
  await dbConnect();
  await Notification.create({ userId: adminId, type, title, message, metadata });
}

/**
 * Sends an email notification to all admins.
 * If the admin email is invalid or the email fails to send,
 * it creates an in-app notification instead.
 */
export async function sendEmailNotification(
  _to: string, // kept for backward compatibility but we now send to all admins
  _subject: string,
  template: string,
  data: Record<string, any>
) {
  try {
    const admins = await getAdmins();
    const { subject, html } = generateEmailHtml(template, data);

    for (const admin of admins) {
      // Always create an in-app notification
      await createAdminNotification(
        admin._id,
        mapTemplateToType(template),
        subject,
        buildNotificationMessage(template, data),
        data
      );

      // Attempt to send email
      if (!isValidEmail(admin.email)) {
        // Email is invalid — notification already created above
        await createAdminNotification(
          admin._id,
          'EMAIL_FAILED',
          '⚠️ Email Delivery Failed',
          `Could not send email notification: invalid email address (${admin.email}). Original: ${subject}`,
          { originalSubject: subject, reason: 'invalid_email', ...data }
        );
        console.log(`[EMAIL SKIPPED] Invalid admin email: ${admin.email}`);
        continue;
      }

      const result = await sendEmail(admin.email, subject, html);
      if (!result.success) {
        // Email failed — notification already created above
        await createAdminNotification(
          admin._id,
          'EMAIL_FAILED',
          '⚠️ Email Delivery Failed',
          `Failed to send: "${subject}". Reason: ${result.error}`,
          { originalSubject: subject, reason: result.error, ...data }
        );
        console.log(`[EMAIL FAILED] Admin: ${admin.email}, Error: ${result.error}`);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL NOTIFICATION ERROR]', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sends an email directly to a specific recipient (e.g., agent assignment notification).
 * This does NOT create admin notifications — it's for agent-facing emails.
 */
export async function sendDirectEmail(
  to: string,
  template: string,
  data: Record<string, any>
) {
  try {
    if (!isValidEmail(to)) {
      console.log(`[EMAIL SKIPPED] Invalid recipient: ${to}`);
      return { success: false, error: 'Invalid email address' };
    }

    const { subject, html } = generateEmailHtml(template, data);
    const result = await sendEmail(to, subject, html);
    return result;
  } catch (error: any) {
    console.error('[DIRECT EMAIL ERROR]', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Maps email template identifiers to notification types.
 */
function mapTemplateToType(template: string): string {
  const map: Record<string, string> = {
    new_lead_alert: 'LEAD_CREATED',
    lead_assignment_confirmation: 'CLIENT_ASSIGNED',
    client_assigned_to_agent: 'CLIENT_ASSIGNED',
    customer_deleted_alert: 'CUSTOMER_DELETED',
    agent_created_alert: 'AGENT_CREATED',
  };
  return map[template] || 'LEAD_CREATED';
}

/**
 * Builds a short plain-text message for in-app notifications.
 */
function buildNotificationMessage(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'new_lead_alert':
      return `New lead "${data.leadName}" has been added with interest in ${data.interest}.`;
    case 'client_assigned_to_agent':
      return `Client "${data.leadName}" has been assigned to agent ${data.agentName}.`;
    case 'customer_deleted_alert':
      return `Customer "${data.leadName}" has been deleted by ${data.deletedBy}.`;
    case 'agent_created_alert':
      return `New agent "${data.agentName}" (${data.agentEmail}) has registered.`;
    default:
      return JSON.stringify(data);
  }
}
