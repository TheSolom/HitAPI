import { PageHeader } from '@/components/layout/PageHeader';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingForm } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useCurrentUserQuery } from '../hooks';
import {
    ProfileDetailsForm,
    ChangePasswordForm,
    ConnectedAccountsCard,
    ActiveSessionsCard,
    DangerZoneCard,
} from '../components';

export function ProfilePage() {
    const userQuery = useCurrentUserQuery();
    const user = userQuery.data ?? null;

    let profileCardContent: React.ReactNode;
    if (userQuery.isLoading) {
        profileCardContent = <LoadingForm />;
    } else if (userQuery.isError) {
        profileCardContent = (
            <ErrorState
                error={userQuery.error}
                onRetry={() => {
                    void userQuery.refetch();
                }}
            />
        );
    } else {
        profileCardContent = <ProfileDetailsForm user={user} />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Profile & Security"
                description="Manage your personal details, credentials, and active sessions."
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Personal Details
                        </CardTitle>
                        <CardDescription>
                            These details appear on team invites and alert
                            notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>{profileCardContent}</CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Password</CardTitle>
                        <CardDescription>
                            Choose a strong password you don&apos;t use anywhere
                            else.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>

                <ConnectedAccountsCard />

                <ActiveSessionsCard />
            </div>

            <div className="pt-2">
                <DangerZoneCard user={user} />
            </div>
        </div>
    );
}
