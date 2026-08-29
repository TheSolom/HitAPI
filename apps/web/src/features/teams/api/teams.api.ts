import { api } from '@/lib/api/client';
import type {
    AddTeamMemberPayload,
    CreateTeamInvitePayload,
    CreateTeamPayload,
    CustomResponse,
    PublicTeamInviteDto,
    TeamInviteDto,
    TeamMemberDto,
    TeamResponseDto,
    UpdateTeamMemberPayload,
    UpdateTeamPayload,
} from '@hitapi/types';

export type GetTeamsResponse = CustomResponse<TeamResponseDto[]>;
export type GetTeamResponse = CustomResponse<TeamResponseDto>;
export type GetTeamMembersResponse = CustomResponse<TeamMemberDto[]>;
export type GetTeamMemberResponse = CustomResponse<TeamMemberDto>;
export type GetTeamInvitesResponse = CustomResponse<TeamInviteDto[]>;
export type GetPublicTeamInviteResponse = CustomResponse<PublicTeamInviteDto>;

export const teamsApi = {
    list: (signal?: AbortSignal) =>
        api.get<GetTeamsResponse>('/teams', undefined, signal),

    get: (teamId: string, signal?: AbortSignal) =>
        api.get<GetTeamResponse>(`/teams/${teamId}`, undefined, signal),

    create: (payload: CreateTeamPayload) =>
        api.post<GetTeamResponse>('/teams', payload),

    update: (teamId: string, payload: UpdateTeamPayload) =>
        api.patch<GetTeamResponse>(`/teams/${teamId}`, payload),

    remove: (teamId: string) => api.delete<undefined>(`/teams/${teamId}`),

    members: (teamId: string, signal?: AbortSignal) =>
        api.get<GetTeamMembersResponse>(
            `/teams/${teamId}/members`,
            undefined,
            signal,
        ),

    getMember: (teamId: string, memberId: string, signal?: AbortSignal) =>
        api.get<GetTeamMemberResponse>(
            `/teams/${teamId}/members/${memberId}`,
            undefined,
            signal,
        ),

    addMember: (teamId: string, payload: AddTeamMemberPayload) =>
        api.post<GetTeamMemberResponse>(`/teams/${teamId}/members`, payload),

    updateMemberRole: (
        teamId: string,
        memberId: string,
        payload: UpdateTeamMemberPayload,
    ) =>
        api.patch<GetTeamMemberResponse>(
            `/teams/${teamId}/members/${memberId}`,
            payload,
        ),

    removeMember: (teamId: string, memberId: string) =>
        api.delete<undefined>(`/teams/${teamId}/members/${memberId}`),

    invites: (teamId: string, signal?: AbortSignal) =>
        api.get<GetTeamInvitesResponse>(
            `/teams/${teamId}/invites`,
            undefined,
            signal,
        ),

    invite: (teamId: string, payload: CreateTeamInvitePayload) =>
        api.post<CustomResponse<TeamInviteDto>>(
            `/teams/${teamId}/invites`,
            payload,
        ),

    getInviteByToken: (token: string, signal?: AbortSignal) =>
        api.get<GetPublicTeamInviteResponse>(
            `/teams/invites/${token}`,
            undefined,
            signal,
        ),

    acceptInvite: (token: string) =>
        api.post<GetTeamMemberResponse>(`/teams/invites/${token}/accept`),

    revokeInvite: (teamId: string, inviteId: string) =>
        api.delete<undefined>(`/teams/${teamId}/invites/${inviteId}`),
};
