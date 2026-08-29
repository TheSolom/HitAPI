import { z } from 'zod';
import { TeamMemberRoles } from '@hitapi/types';

export const inviteMemberSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    role: z.enum(TeamMemberRoles),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
