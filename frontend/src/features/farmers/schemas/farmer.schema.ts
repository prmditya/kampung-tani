import { z } from 'zod';

const baseFarmerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact: z.string().optional(),
  address: z.string().optional(),
});

export const addFarmerSchema = baseFarmerSchema;

export const updateFarmerSchema = baseFarmerSchema.extend({
  id: z.number().min(1, 'Failed to get farmer ID'),
});
