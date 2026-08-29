import { z } from 'zod';

export const profileSchema = z.object({
    displayName: z
        .string()
        .trim()
        .min(2, 'Display name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
