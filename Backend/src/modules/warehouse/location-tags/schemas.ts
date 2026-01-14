import { z } from 'zod';

export const createLocationTagSchema = z.object({
  unitId: z.string().uuid(),
  locationTagName: z.string().min(1).max(200),
  capacity: z.number().int().positive(),
});

export const updateLocationTagSchema = createLocationTagSchema.partial();

export type CreateLocationTagInput = z.infer<typeof createLocationTagSchema>;
export type UpdateLocationTagInput = z.infer<typeof updateLocationTagSchema>;
