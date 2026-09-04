import { z } from 'zod';
import { RestfulMethod } from '@hitapi/shared/enums';

export const updateEndpointConfigSchema = z.object({
    method: z.enum(RestfulMethod),
    path: z.string().min(1, 'Path is required'),
    excluded: z.boolean().optional(),
    targetResponseTimeMs: z
        .number()
        .int('Must be an integer')
        .min(10, 'Target response time must be at least 10ms')
        .max(60000, 'Target response time cannot exceed 60,000ms')
        .refine(
            (val) => val % 10 === 0,
            'Target response time must be a multiple of 10ms',
        )
        .optional()
        .nullable(),
});

export type UpdateEndpointConfigFormValues = z.infer<
    typeof updateEndpointConfigSchema
>;

export const updateEndpointErrorConfigSchema = z.object({
    method: z.enum(RestfulMethod),
    path: z.string().min(1, 'Path is required'),
    statusCode: z
        .number()
        .int('Status code must be an integer')
        .min(100, 'Invalid status code')
        .max(599, 'Invalid status code'),
    expected: z.boolean(),
});

export type UpdateEndpointErrorConfigFormValues = z.infer<
    typeof updateEndpointErrorConfigSchema
>;

export const getEndpointsFilterSchema = z.object({
    search: z.string().optional(),
});

export type GetEndpointsFilterValues = z.infer<typeof getEndpointsFilterSchema>;
