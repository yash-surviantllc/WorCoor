import { z } from 'zod';

const unitStatusEnum = z.enum(['LIVE', 'OFFLINE', 'MAINTENANCE', 'PLANNING']);

export const createUnitSchema = z.object({
  unitName: z.string().min(1).max(255),
  unitType: z.string().min(1).max(100),
  status: unitStatusEnum,
  description: z.string().max(1000).optional().nullable(),
});

export const updateUnitSchema = createUnitSchema.partial();

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
