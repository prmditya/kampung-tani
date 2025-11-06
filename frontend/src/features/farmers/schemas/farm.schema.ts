import { z } from 'zod';

const baseFarmSchema = z.object({
  farmer_id: z.number(),
  name: z.string().min(1, 'Farm name is required'),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  area_size: z.number().positive('Area size must be positive').optional(),
  soil_type: z.string().optional(),
});

export const addFarmSchema = baseFarmSchema;

export const updateFarmSchema = baseFarmSchema.extend({
  id: z.number(),
});

export type FarmFormData = z.infer<typeof addFarmSchema>;
