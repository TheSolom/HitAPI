export enum TeamMemberRoles {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
}

export type TeamMemberRole = 'owner' | 'admin' | 'member';

export enum InviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    REVOKED = 'revoked',
}

export interface InviterDto {
    userId: string;
    displayName: string;
    email: string;
}

export interface TeamMemberDto {
    id: string;
    userId: string;
    displayName: string;
    email: string;
    role: TeamMemberRoles;
    joinedAt: Date | string;
}

export interface TeamInviteDto {
    id: string;
    email: string;
    status: InviteStatus;
    inviter: InviterDto;
    expiresAt: Date | string;
}

export interface PublicTeamInviteDto {
    team: { name: string };
    email: string;
    expiresAt: Date | string;
}

export interface TeamResponseDto {
    id: string;
    name: string;
    slug: string;
    demo: boolean;
    stealth: boolean;
    teamMembers?: TeamMemberDto[];
    invites?: TeamInviteDto[];
    createdAt: Date | string;
}

export interface CreateTeamPayload {
    name: string;
    demo?: boolean;
    stealth?: boolean;
}

export interface UpdateTeamPayload {
    name?: string;
    demo?: boolean;
    stealth?: boolean;
}

export interface CreateTeamInvitePayload {
    email: string;
    memberId: string;
}

export interface AddTeamMemberPayload {
    userId: string;
    role?: TeamMemberRoles;
}

export interface UpdateTeamMemberPayload {
    role: TeamMemberRoles;
}
