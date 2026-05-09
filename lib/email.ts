import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter using SMTP credentials from environment variables.
 * Supports Gmail, Outlook, or any custom SMTP server.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  });
}

/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sends an email using the configured SMTP transporter.
 * Returns { success: true } on success, or { success: false, error } on failure.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return {
        success: false,
        error: 'SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local',
      };
    }

    if (!isValidEmail(to)) {
      return {
        success: false,
        error: `Invalid email address: ${to}`,
      };
    }

    await transporter.sendMail({
      from: `"Estate CRM" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EMAIL FAILED] To: ${to}, Error:`, error.message);
    return { success: false, error: error.message };
  }
}
