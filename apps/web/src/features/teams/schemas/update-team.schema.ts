import { z } from 'zod';

export const updateTeamSchema = z.object({
    name: z
        .string()
        .min(2, 'Team name must be at least 2 characters')
        .max(100, 'Team name cannot exceed 100 characters')
        .optional(),
    demo: z.boolean().optional(),
    stealth: z.boolean().optional(),
});

export type UpdateTeamFormValues = z.infer<typeof updateTeamSchema>;
