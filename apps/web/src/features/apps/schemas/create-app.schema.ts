import { z } from 'zod';

export const createAppSchema = z.object({
    name: z
        .string()
        .min(2, 'App name must be at least 2 characters')
        .max(100, 'App name cannot exceed 100 characters'),
    frameworkId: z.number().min(1, 'Please select a framework'),
    teamId: z.string().min(1, 'Please select a team'),
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
});

export type CreateAppFormValues = z.infer<typeof createAppSchema>;
