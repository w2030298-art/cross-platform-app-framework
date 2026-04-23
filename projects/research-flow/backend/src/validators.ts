import { z } from 'zod';

export const createExperimentSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().transform(v => new Date(v)).optional(),
  type: z.enum([
    'ALGORITHM_VERIFICATION',
    'HYPERPARAM_TUNING',
    'ABLATION_STUDY',
    'REPRODUCTION',
    'DATA_COLLECTION',
    'OTHER',
  ]),
  purpose: z.string().max(2000).optional(),
  process: z.string().max(50000).optional(),
  result: z.string().max(2000).optional(),
  conclusion: z.string().max(2000).optional(),
  nextStep: z.string().max(2000).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  projectId: z.string().optional(),
});

export const updateExperimentSchema = createExperimentSchema.partial();

export const listExperimentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'FAILED', 'PAUSED']).optional(),
  type: z.enum([
    'ALGORITHM_VERIFICATION',
    'HYPERPARAM_TUNING',
    'ABLATION_STUDY',
    'REPRODUCTION',
    'DATA_COLLECTION',
    'OTHER',
  ]).optional(),
  authorId: z.string().optional(),
  labId: z.string().optional(),
  keyword: z.string().optional(),
  startDate: z.string().transform(v => new Date(v)).optional(),
  endDate: z.string().transform(v => new Date(v)).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  quote: z.string().max(1000).optional(),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).default('NORMAL'),
  parentId: z.string().optional(),
});

export const createPaperSchema = z.object({
  title: z.string().min(1).max(300),
  abstract: z.string().max(5000).optional(),
  keywords: z.union([z.array(z.string()), z.string()]).optional(),
  venue: z.string().max(200).optional(),
  projectId: z.string().optional(),
  status: z.enum([
    'IDEA', 'PROPOSAL', 'EXPERIMENT', 'DATA_ANALYSIS',
    'WRITING', 'SUBMITTED', 'REVIEW', 'REVISION',
    'ACCEPTED', 'PUBLISHED',
  ]).default('IDEA'),
});

export const createMilestoneSchema = z.object({
  stage: z.enum([
    'IDEA', 'PROPOSAL', 'EXPERIMENT', 'DATA_ANALYSIS',
    'WRITING', 'SUBMITTED', 'REVIEW', 'REVISION',
    'ACCEPTED', 'PUBLISHED',
  ]),
  plannedDate: z.string().transform(v => new Date(v)),
  note: z.string().max(1000).optional(),
});

export const createEquipmentSchema = z.object({
  name: z.string().min(1).max(100),
  model: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
});

export const createBookingSchema = z.object({
  equipmentId: z.string(),
  startTime: z.string().transform(v => new Date(v)),
  endTime: z.string().transform(v => new Date(v)),
  purpose: z.string().max(500).optional(),
});

export const generateWeeklyReportSchema = z.object({
  labId: z.string(),
  weekStart: z.string().transform(v => new Date(v)),
  weekEnd: z.string().transform(v => new Date(v)),
});

export type CreateExperimentInput = z.infer<typeof createExperimentSchema>;
export type UpdateExperimentInput = z.infer<typeof updateExperimentSchema>;
export type ListExperimentQuery = z.infer<typeof listExperimentQuerySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreatePaperInput = z.infer<typeof createPaperSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type GenerateWeeklyReportInput = z.infer<typeof generateWeeklyReportSchema>;