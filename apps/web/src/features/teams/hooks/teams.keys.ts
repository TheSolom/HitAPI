export const teamKeys = {
    all: ['teams'] as const,
    lists: () => [...teamKeys.all, 'list'] as const,
    details: () => [...teamKeys.all, 'detail'] as const,
    detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
    members: (teamId: string) =>
        [...teamKeys.detail(teamId), 'members'] as const,
    member: (teamId: string, memberId: string) =>
        [...teamKeys.members(teamId), memberId] as const,
    invites: (teamId: string) =>
        [...teamKeys.detail(teamId), 'invites'] as const,
    inviteToken: (token: string) =>
        [...teamKeys.all, 'invite-token', token] as const,
};
