import { useQuery } from '@tanstack/react-query';
import {
    teamsApi,
    type GetPublicTeamInviteResponse,
    type GetTeamInvitesResponse,
    type GetTeamMemberResponse,
    type GetTeamMembersResponse,
    type GetTeamResponse,
    type GetTeamsResponse,
} from '../api';
import { teamKeys } from './teams.keys';

export function useTeamsQuery() {
    return useQuery<GetTeamsResponse>({
        queryKey: teamKeys.lists(),
        queryFn: ({ signal }) => teamsApi.list(signal),
    });
}

export function useTeamQuery(teamId: string) {
    return useQuery<GetTeamResponse>({
        queryKey: teamKeys.detail(teamId),
        queryFn: ({ signal }) => teamsApi.get(teamId, signal),
        enabled: Boolean(teamId),
    });
}

export function useTeamMembersQuery(teamId: string) {
    return useQuery<GetTeamMembersResponse>({
        queryKey: teamKeys.members(teamId),
        queryFn: ({ signal }) => teamsApi.members(teamId, signal),
        enabled: Boolean(teamId),
    });
}

export function useTeamMemberQuery(teamId: string, memberId: string) {
    return useQuery<GetTeamMemberResponse>({
        queryKey: teamKeys.member(teamId, memberId),
        queryFn: ({ signal }) => teamsApi.getMember(teamId, memberId, signal),
        enabled: Boolean(teamId && memberId),
    });
}

export function useTeamInvitesQuery(teamId: string) {
    return useQuery<GetTeamInvitesResponse>({
        queryKey: teamKeys.invites(teamId),
        queryFn: ({ signal }) => teamsApi.invites(teamId, signal),
        enabled: Boolean(teamId),
    });
}

export function usePublicTeamInviteQuery(token: string) {
    return useQuery<GetPublicTeamInviteResponse>({
        queryKey: teamKeys.inviteToken(token),
        queryFn: ({ signal }) => teamsApi.getInviteByToken(token, signal),
        enabled: Boolean(token),
    });
}
