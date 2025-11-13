import { z } from 'zod';

export const ISO_DATE_TIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export const assignmentSchema = z
  .object({
    gateway_id: z.string().min(1, 'Gateway is required'),
    farm_id: z.string().min(1, 'Farm is required'),
    start_date: z
      .string()
      .regex(
        ISO_DATE_TIME_REGEX,
        'Start date must be a valid ISO 8601 datetime',
      ),
    end_date: z
      .string()
      .regex(ISO_DATE_TIME_REGEX, 'End date must be a valid ISO 8601 datetime')
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return start < end;
    },
    {
      message: 'Start date must be before end date',
      path: ['end_date'],
    },
  );

export type AssignmentFormData = z.infer<typeof assignmentSchema>;
