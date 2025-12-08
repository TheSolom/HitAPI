export enum TeamMemberRoles {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
}

export const TeamMemberRolePriority: Record<TeamMemberRoles, number> = {
    [TeamMemberRoles.OWNER]: 1,
    [TeamMemberRoles.ADMIN]: 2,
    [TeamMemberRoles.MEMBER]: 3,
};
