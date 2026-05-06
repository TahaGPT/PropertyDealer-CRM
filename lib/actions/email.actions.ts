'use server';

export async function sendEmailNotification(to: string, subject: string, template: string, data: any) {
  console.log(`[MOCK EMAIL SENT] To: ${to}, Subject: ${subject}`);
  console.log(`[TEMPLATE]: ${template}`);
  console.log(`[DATA]:`, data);
  
  // In a real app, you'd use nodemailer or a service like Resend/SendGrid
  return { success: true };
}
