import { z } from 'zod';
import { TeamMemberRoles } from '@hitapi/types';

export const updateMemberRoleSchema = z.object({
    role: z.enum(TeamMemberRoles),
});

export type UpdateMemberRoleFormValues = z.infer<typeof updateMemberRoleSchema>;
