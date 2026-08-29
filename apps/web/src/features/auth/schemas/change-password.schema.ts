import { z } from 'zod';

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(6, 'New password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        path: ['newPassword'],
        message: 'New password must be different from current password',
    });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
