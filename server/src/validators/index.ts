import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email().max(255);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export const setPasswordSchema = z.object({
  email: emailSchema,
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(10).max(200),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(500),
  newPassword: z.string().min(10).max(200),
});

const fileCategory = z.enum([
  'plan_master',
  'plan_floor',
  'elevation',
  'sections',
  'rcp_layouts',
  'references',
]);

export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(100),
  conceptNote: z.string().trim().max(250),
  numberOfViews: z.number().int().min(1).max(10),
  files: z
    .array(
      z.object({
        category: fileCategory,
        originalName: z.string().trim().min(1).max(255),
        sizeBytes: z.number().int().positive(),
      }),
    )
    .min(1)
    .max(200),
});

export const confirmUploadSchema = z.object({
  fileId: z.string().uuid(),
});

export const requestRevisionSchema = z.object({
  notes: z.string().trim().max(500).optional().default(''),
});

export const studioStatusSchema = z.object({
  toStatus: z.enum(['in_progress', 'revision_1_in_progress', 'revision_2_in_progress']),
});

export const deliverablePresignSchema = z.object({
  views: z
    .array(
      z.object({
        viewNumber: z.number().int().min(1).max(10),
        originalName: z.string().trim().min(1).max(255),
        sizeBytes: z.number().int().positive(),
      }),
    )
    .min(1)
    .max(200),
});

export const deliverableConfirmSchema = z.object({
  deliverableIds: z.array(z.string().uuid()).min(1).max(200),
});

export const flagIssueSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: emailSchema,
  role: z.enum(['client', 'studio', 'admin']),
  companyName: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(20).optional(),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  role: z.enum(['client', 'studio', 'admin']).optional(),
  companyName: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
});

export const adminOverrideStatusSchema = z.object({
  toStatus: z.enum([
    'pending',
    'accepted',
    'in_progress',
    'first_draft_submitted',
    'revision_1_requested',
    'revision_1_in_progress',
    'revision_1_submitted',
    'revision_2_requested',
    'revision_2_in_progress',
    'revision_2_submitted',
    'completed',
    'closed',
  ]),
  reason: z.string().trim().min(1).max(500),
});
