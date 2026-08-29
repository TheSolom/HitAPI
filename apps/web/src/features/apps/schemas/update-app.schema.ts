import { z } from 'zod';

export const updateAppSchema = z.object({
    name: z
        .string()
        .min(2, 'App name must be at least 2 characters')
        .max(100, 'App name cannot exceed 100 characters')
        .optional(),
    frameworkId: z.number().min(1).optional(),
    targetResponseTimeMs: z
        .number()
        .int('Target response time must be an integer')
        .min(10, 'Target response time must be at least 10ms')
        .max(60000, 'Target response time cannot exceed 60,000ms')
        .refine(
            (val) => val % 10 === 0,
            'Target response time must be a multiple of 10ms',
        )
        .optional(),
    active: z.boolean().optional(),
});

export type UpdateAppFormValues = z.infer<typeof updateAppSchema>;
