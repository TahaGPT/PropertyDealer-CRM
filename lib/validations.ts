import { z } from 'zod';

// Validation schemas for API routes and server actions

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'AGENT']).optional().default('AGENT'),
});

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  propertyInterest: z.string().min(1, 'Property interest is required'),
  budget: z.number().positive('Budget must be a positive number'),
  notes: z.string().optional().default(''),
});

export const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED', 'LOST']).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.union([z.date(), z.string()]).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  propertyInterest: z.string().optional(),
  budget: z.number().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Validates data against a Zod schema.
 * Returns { success: true, data } or { success: false, errors } 
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
}
