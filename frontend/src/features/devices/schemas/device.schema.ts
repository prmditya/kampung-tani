import { z } from 'zod';

const MAC_ADDRESS_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const baseGatewaySchema = z.object({
  name: z.string().optional(),
  mac_address: z
    .string()
    .optional()
    .refine(
      (val) => !val || MAC_ADDRESS_REGEX.test(val),
      'MAC address must be in format XX:XX:XX:XX:XX:XX',
    ),
  description: z.string().optional(),
});

export const addGatewaySchema = baseGatewaySchema.extend({
  gateway_uid: z
    .string()
    .min(1, 'Gateway UID is required')
    .regex(
      /^GTW-[A-Fa-f0-9]{6}$/,
      'Gateway UID must be in format GTW-XXXXXX (6 hex digits from last 6 digits of MAC address)',
    ),
  // Status will be automatically set to 'offline' by backend
});

export const updateGatewaySchema = baseGatewaySchema.extend({
  id: z.number().min(1, 'Failed to get device ID'),
  status: z.enum(['online', 'offline', 'maintenance']),
});
