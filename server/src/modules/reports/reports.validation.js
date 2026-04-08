import { z } from 'zod';

export const generateReportSchema = z.object({
  rawInput: z.string().min(15).max(12000),
});

export const saveReportSchema = z.object({
  rawInput: z.string().min(15).max(12000),
  bugTitle: z.string().min(3).max(240),
  summary: z.string().min(3),
  module: z.string().min(1),
  environment: z.string().min(1),
  preconditions: z.string().min(1),
  stepsToReproduce: z.array(z.string().min(1)).min(1),
  expectedResult: z.string().min(1),
  actualResult: z.string().min(1),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  labels: z.array(z.string().min(1)).max(20),
  possibleRootCause: z.string().min(1),
  additionalNotes: z.string().min(1),
});

export const listReportsQuerySchema = z.object({
  search: z.string().optional(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export const reportIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
