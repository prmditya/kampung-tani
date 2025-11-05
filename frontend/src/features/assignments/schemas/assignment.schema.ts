import { z } from 'zod';

export const isoDatetimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export const assignmentSchema = z.object({
  gateway_id: z.string().min(1, 'Gateway is required'),
  farm_id: z.string().min(1, 'Farm is required'),
  start_date: z
    .string()
    .regex(isoDatetimeRegex, 'Start date must be a valid ISO 8601 datetime')
    .optional(),
  end_date: z
    .string()
    .regex(isoDatetimeRegex, 'End date must be a valid ISO 8601 datetime')
    .optional(),
});
