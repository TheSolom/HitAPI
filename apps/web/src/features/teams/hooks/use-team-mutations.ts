import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    AddTeamMemberPayload,
    CreateTeamInvitePayload,
    CreateTeamPayload,
    UpdateTeamMemberPayload,
    UpdateTeamPayload,
} from '@hitapi/types';
import { teamsApi } from '../api';
import { teamKeys } from './teams.keys';

export function useCreateTeamMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTeamPayload) => teamsApi.create(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: teamKeys.all });
            toast.success('Team created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create team');
        },
    });
}

export function useUpdateTeamMutation(teamId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateTeamPayload) =>
            teamsApi.update(teamId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: teamKeys.detail(teamId),
            });
            void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            toast.success('Team updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update team');
        },
    });
}

export function useDeleteTeamMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (teamId: string) => teamsApi.remove(teamId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: teamKeys.all });
            toast.success('Team deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete team');
        },
    });
}

export function useAddMemberMutation(teamId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddTeamMemberPayload) =>
            teamsApi.addMember(teamId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: teamKeys.members(teamId),
            });
            toast.success('Team member added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add team member');
        },
    });
}

export function useUpdateMemberRoleMutation(teamId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            memberId,
            ...payload
        }: UpdateTeamMemberPayload & { memberId: string }) =>
            teamsApi.updateMemberRole(teamId, memberId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: teamKeys.members(teamId),
            });
            toast.success('Member role updated');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update member role');
        },
    });
}

export function useRemoveMemberMutation(teamId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (memberId: string) =>
            teamsApi.removeMember(teamId, memberId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: teamKeys.members(teamId),
            });
            toast.success('Member removed');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to remove member');
        },
    });
}

export function useInviteMemberMutation(teamId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTeamInvitePayload) =>
            teamsApi.invite(teamId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: teamKeys.invites(teamId),
            });
            toast.success('Invite sent');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send invite');
        },
    });
}

export function useRevokeInviteMutation(teamId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (inviteId: string) =>
            teamsApi.revokeInvite(teamId, inviteId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: teamKeys.invites(teamId),
            });
            toast.success('Invite revoked');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to revoke invite');
        },
    });
}

export function useAcceptInviteMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (token: string) => teamsApi.acceptInvite(token),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: teamKeys.all });
            toast.success('Invite accepted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to accept invite');
        },
    });
}
