// Email template identifiers — kept outside "use server" files
// because Next.js only allows async function exports from server action files.

export const EMAIL_TEMPLATES = {
  NEW_LEAD: 'new_lead_alert',
  ASSIGNMENT: 'lead_assignment_confirmation',
  CUSTOMER_DELETED: 'customer_deleted_alert',
  AGENT_CREATED: 'agent_created_alert',
  CLIENT_ASSIGNED: 'client_assigned_to_agent',
} as const;

/**
 * Generates styled HTML email content for each notification type.
 */
export function generateEmailHtml(
  template: string,
  data: Record<string, any>
): { subject: string; html: string } {
  const baseStyle = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  `;

  const headerStyle = `
    background: linear-gradient(135deg, #517561 0%, #629c7c 100%);
    padding: 32px 24px;
    text-align: center;
    color: #ffffff;
  `;

  const bodyStyle = `padding: 32px 24px;`;

  const detailRowStyle = `
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  `;

  const footerStyle = `
    padding: 20px 24px;
    text-align: center;
    background: #f4f7f5;
    color: #6b7280;
    font-size: 12px;
  `;

  switch (template) {
    case EMAIL_TEMPLATES.NEW_LEAD:
      return {
        subject: `🏠 New Lead: ${data.leadName}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0; font-size:24px;">🏠 New Lead Created</h1>
              <p style="margin:8px 0 0; opacity:0.9;">A new lead has been added to the CRM</p>
            </div>
            <div style="${bodyStyle}">
              <div style="${detailRowStyle}">
                <strong>Name:</strong> <span>${data.leadName}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Property Interest:</strong> <span>${data.interest}</span>
              </div>
              ${data.budget ? `<div style="${detailRowStyle}"><strong>Budget:</strong> <span>PKR ${Number(data.budget).toLocaleString()}</span></div>` : ''}
              ${data.email ? `<div style="${detailRowStyle}"><strong>Email:</strong> <span>${data.email}</span></div>` : ''}
              ${data.phone ? `<div style="${detailRowStyle}"><strong>Phone:</strong> <span>${data.phone}</span></div>` : ''}
            </div>
            <div style="${footerStyle}">
              <p style="margin:0;">Estate CRM — Property Dealer Management System</p>
            </div>
          </div>
        `,
      };

    case EMAIL_TEMPLATES.CLIENT_ASSIGNED:
      return {
        subject: `👤 Client Assigned: ${data.leadName} → ${data.agentName}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0; font-size:24px;">👤 Client Assigned to Agent</h1>
              <p style="margin:8px 0 0; opacity:0.9;">A client has been assigned to an agent</p>
            </div>
            <div style="${bodyStyle}">
              <div style="${detailRowStyle}">
                <strong>Client:</strong> <span>${data.leadName}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Assigned Agent:</strong> <span>${data.agentName}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Agent Email:</strong> <span>${data.agentEmail}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Property Interest:</strong> <span>${data.interest}</span>
              </div>
            </div>
            <div style="${footerStyle}">
              <p style="margin:0;">Estate CRM — Property Dealer Management System</p>
            </div>
          </div>
        `,
      };

    case EMAIL_TEMPLATES.CUSTOMER_DELETED:
      return {
        subject: `🗑️ Customer Deleted: ${data.leadName}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}; background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);">
              <h1 style="margin:0; font-size:24px;">🗑️ Customer Deleted</h1>
              <p style="margin:8px 0 0; opacity:0.9;">A customer record has been removed from the CRM</p>
            </div>
            <div style="${bodyStyle}">
              <div style="${detailRowStyle}">
                <strong>Customer Name:</strong> <span>${data.leadName}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Deleted By:</strong> <span>${data.deletedBy}</span>
              </div>
              ${data.email ? `<div style="${detailRowStyle}"><strong>Email:</strong> <span>${data.email}</span></div>` : ''}
              ${data.interest ? `<div style="${detailRowStyle}"><strong>Property Interest:</strong> <span>${data.interest}</span></div>` : ''}
            </div>
            <div style="${footerStyle}">
              <p style="margin:0;">Estate CRM — Property Dealer Management System</p>
            </div>
          </div>
        `,
      };

    case EMAIL_TEMPLATES.AGENT_CREATED:
      return {
        subject: `🎉 New Agent Registered: ${data.agentName}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0; font-size:24px;">🎉 New Agent Registered</h1>
              <p style="margin:8px 0 0; opacity:0.9;">A new agent has joined the CRM</p>
            </div>
            <div style="${bodyStyle}">
              <div style="${detailRowStyle}">
                <strong>Agent Name:</strong> <span>${data.agentName}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Email:</strong> <span>${data.agentEmail}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Registered At:</strong> <span>${new Date().toLocaleString()}</span>
              </div>
            </div>
            <div style="${footerStyle}">
              <p style="margin:0;">Estate CRM — Property Dealer Management System</p>
            </div>
          </div>
        `,
      };

    case EMAIL_TEMPLATES.ASSIGNMENT:
      return {
        subject: `📋 New Lead Assigned: ${data.leadName}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0; font-size:24px;">📋 Lead Assigned to You</h1>
              <p style="margin:8px 0 0; opacity:0.9;">You've been assigned a new lead</p>
            </div>
            <div style="${bodyStyle}">
              <div style="${detailRowStyle}">
                <strong>Client Name:</strong> <span>${data.leadName}</span>
              </div>
              <div style="${detailRowStyle}">
                <strong>Property Interest:</strong> <span>${data.interest}</span>
              </div>
            </div>
            <div style="${footerStyle}">
              <p style="margin:0;">Estate CRM — Property Dealer Management System</p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: 'CRM Notification',
        html: `<p>${JSON.stringify(data)}</p>`,
      };
  }
}
