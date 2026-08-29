import { z } from 'zod';

export const resendVerificationSchema = z.object({
    email: z.email('Enter a valid email address'),
});

export type ResendVerificationFormData = z.infer<
    typeof resendVerificationSchema
>;
