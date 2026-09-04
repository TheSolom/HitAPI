import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { TeamMemberRoles } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth-store';
import { inviteMemberSchema, type InviteMemberFormValues } from '../../schemas';
import { useInviteMemberMutation } from '../../hooks';

interface InviteMemberFormProps {
    readonly teamId: string;
}

const ROLES = [TeamMemberRoles.ADMIN, TeamMemberRoles.MEMBER] as const;

export function InviteMemberForm({ teamId }: InviteMemberFormProps) {
    const invite = useInviteMemberMutation(teamId);
    const currentUser = useAuthStore((s) => s.user);

    const form = useForm<InviteMemberFormValues>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            email: '',
            role: TeamMemberRoles.MEMBER,
        },
    });

    const handleSubmit = (values: InviteMemberFormValues) => {
        const memberId = currentUser?.id ?? '';
        invite.mutate(
            {
                email: values.email,
                memberId,
            },
            {
                onSuccess: () => {
                    form.reset({
                        email: '',
                        role: values.role,
                    });
                },
            },
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Invite a member
                </CardTitle>
                <CardDescription>
                    They'll receive an email invitation valid for 7 days.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-4"
                        noValidate
                        onSubmit={(event) => {
                            void form.handleSubmit(handleSubmit)(event);
                        }}
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="teammate@company.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger aria-label="Select member role">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                    className="capitalize"
                                                >
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={invite.isPending}
                        >
                            {invite.isPending ? 'Sending...' : 'Send invite'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
