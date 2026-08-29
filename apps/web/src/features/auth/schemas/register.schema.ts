import { z } from 'zod';

export const registerSchema = z.object({
    displayName: z.string().trim().min(1, 'Display name is required'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
