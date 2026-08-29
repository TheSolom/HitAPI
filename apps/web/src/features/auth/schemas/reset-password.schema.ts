import { z } from 'zod';

export const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
