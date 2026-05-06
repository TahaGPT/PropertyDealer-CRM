// Email template identifiers — kept outside "use server" files
// because Next.js only allows async function exports from server action files.

export const EMAIL_TEMPLATES = {
  NEW_LEAD: 'new_lead_alert',
  ASSIGNMENT: 'lead_assignment_confirmation',
} as const;
