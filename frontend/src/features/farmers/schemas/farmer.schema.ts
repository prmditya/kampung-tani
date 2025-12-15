import { z } from 'zod';

// Indonesian phone number validation (without +62 prefix, just the digits after)
// Valid formats: 8xxxxxxxxxx (8-13 digits starting with 8)
const phoneNumberSchema = z
  .string()
  .regex(/^[0-9]*$/, 'Phone number must contain only digits')
  .refine(
    (val) => val === '' || (val.length >= 10 && val.length <= 12),
    'Phone number must be 10-12 digits',
  )
  .refine(
    (val) => val === '' || val.startsWith('8'),
    'Phone number must start with 8 (e.g., 812xxxxxxxx)',
  )
  .optional();

const baseFarmerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact: phoneNumberSchema,
  address: z.string().optional(),
});

export const addFarmerSchema = baseFarmerSchema;

export const updateFarmerSchema = baseFarmerSchema.extend({
  id: z.number().min(1, 'Failed to get farmer ID'),
});
