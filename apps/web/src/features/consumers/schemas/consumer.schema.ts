import { z } from 'zod';

export const createConsumerSchema = z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    name: z.string().optional(),
    groupId: z.number().int().optional(),
    hidden: z.boolean().optional(),
});

export type CreateConsumerFormValues = z.infer<typeof createConsumerSchema>;

export const updateConsumerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    consumerGroupId: z.number().int().optional().nullable(),
});

export type UpdateConsumerFormValues = z.infer<typeof updateConsumerSchema>;

export const createConsumerGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    consumerIds: z.array(z.number().int()).optional(),
});

export type CreateConsumerGroupFormValues = z.infer<
    typeof createConsumerGroupSchema
>;

export const updateConsumerGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    consumerIds: z.array(z.number().int()).optional().nullable(),
});

export type UpdateConsumerGroupFormValues = z.infer<
    typeof updateConsumerGroupSchema
>;
