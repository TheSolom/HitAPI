import type { ReactNode } from 'react';
import {
    createRootRoute,
    createRoute,
    createRouter,
    redirect,
} from '@tanstack/react-router';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/auth-store';
import {
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    VerifyEmailPage,
    ProfilePage,
    AuthCallbackPage,
} from '@/features/auth';
import { TeamsPage } from '@/features/teams';
import { AppsPage } from '@/features/apps';
import { RequestLogsPage } from '@/features/request-logs/pages/RequestLogsPage';
import {
    AppDetailRouteComponent,
    ConsumerDetailRouteComponent,
    ConsumersRouteComponent,
    EndpointsRouteComponent,
    ErrorsRouteComponent,
    IndexComponent,
    PlaceholderRouteComponent,
    ResourcesRouteComponent,
    RootComponent,
    TeamDetailRouteComponent,
    TrafficRouteComponent,
    PerformanceRouteComponent,
} from './routes/route-components';
import {
    validateTrafficSearch,
    validateErrorsSearch,
    validatePerformanceSearch,
} from './routes/route-search';

/* ---------------------------------- Root ---------------------------------- */

const rootRoute = createRootRoute({
    component: RootComponent,
});

/* ----------------------------- Public Routes ----------------------------- */

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    validateSearch: (
        search: Record<string, unknown>,
    ): { redirect?: string } => ({
        redirect:
            typeof search.redirect === 'string' ? search.redirect : undefined,
    }),
    beforeLoad: ({ search }) => {
        if (useAuthStore.getState().token) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({
                to: search.redirect ?? '/apps',
            });
        }
    },
    component: LoginPage,
});

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: RegisterPage,
});

const forgotPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/forgot-password',
    component: ForgotPasswordPage,
});

const resetPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reset-password',
    validateSearch: (search: Record<string, unknown>): { token?: string } => ({
        token: typeof search.token === 'string' ? search.token : undefined,
    }),
    component: ResetPasswordPage,
});

const verifyEmailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/verify-email',
    validateSearch: (
        search: Record<string, unknown>,
    ): { token?: string; email?: string } => ({
        token: typeof search.token === 'string' ? search.token : undefined,
        email: typeof search.email === 'string' ? search.email : undefined,
    }),
    component: VerifyEmailPage,
});

const authCallbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/callback',
    component: AuthCallbackPage,
});

/* --------------------------- Protected App Shell -------------------------- */

const protectedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'protected',
    beforeLoad: ({ location }) => {
        if (!useAuthStore.getState().token) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({
                to: '/login',
                search: { redirect: location.pathname },
            });
        }
    },
    component: AppShell,
});

/* -------------------- Protected Route Factory Helpers --------------------- */

function createChildRoute<P extends string>(
    path: P,
    component: () => ReactNode,
) {
    return createRoute({
        getParentRoute: () => protectedRoute,
        path,
        component,
    });
}

function createPlaceholderRoute<P extends string>(
    path: P,
    title: string,
    description: string,
    phase: string,
) {
    return createRoute({
        getParentRoute: () => protectedRoute,
        path,
        component: function PlaceholderRoute() {
            return (
                <PlaceholderRouteComponent
                    title={title}
                    description={description}
                    phase={phase}
                />
            );
        },
    });
}

/* ------------------------------ Index Route ------------------------------- */

const indexRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/',
    beforeLoad: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({ to: '/apps' });
    },
    component: IndexComponent,
});

/* ------------------------- Simple Child Routes ---------------------------- */

const profileRoute = createChildRoute('/profile', ProfilePage);
const teamsRoute = createChildRoute('/teams', TeamsPage);
const appsRoute = createChildRoute('/apps', AppsPage);
const logsRoute = createChildRoute('/logs', RequestLogsPage);

/* -------------------------- Parametric Routes ----------------------------- */

const teamDetailRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/teams/$teamId',
    component: TeamDetailRouteComponent,
});

const appDetailRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/apps/$appId',
    component: AppDetailRouteComponent,
});

const consumerDetailRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/consumers/$consumerId',
    component: ConsumerDetailRouteComponent,
});

/* ------------------------- Search-Validated Routes ------------------------ */

const consumersRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/consumers',
    validateSearch: (
        search: Record<string, unknown>,
    ): {
        appId?: string;
        groupId?: string;
        tab?: 'consumers' | 'groups';
    } => ({
        appId: typeof search.appId === 'string' ? search.appId : undefined,
        groupId:
            typeof search.groupId === 'string' ||
            typeof search.groupId === 'number'
                ? String(search.groupId)
                : undefined,
        tab: search.tab === 'groups' ? 'groups' : 'consumers',
    }),
    component: ConsumersRouteComponent,
});

const endpointsRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/endpoints',
    validateSearch: (search: Record<string, unknown>): { appId?: string } => ({
        appId: typeof search.appId === 'string' ? search.appId : undefined,
    }),
    component: EndpointsRouteComponent,
});

const resourcesRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/resources',
    validateSearch: (search: Record<string, unknown>): { appId?: string } => ({
        appId: typeof search.appId === 'string' ? search.appId : undefined,
    }),
    component: ResourcesRouteComponent,
});

const errorsRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/errors',
    validateSearch: validateErrorsSearch,
    component: ErrorsRouteComponent,
});

const trafficRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/traffic',
    validateSearch: validateTrafficSearch,
    component: TrafficRouteComponent,
});

const performanceRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/performance',
    validateSearch: validatePerformanceSearch,
    component: PerformanceRouteComponent,
});

/* ------------------- Redirect Routes (Legacy Aliases) -------------------- */

const consumerGroupsRoute = createRoute({
    getParentRoute: () => protectedRoute,
    path: '/consumer-groups',
    beforeLoad: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
            to: '/consumers',
            search: { tab: 'groups' },
        });
    },
});

/* ----------------------- Scaffold (Coming-Soon) Routes -------------------- */

const scaffoldRoutes = [
    createPlaceholderRoute(
        '/alerts',
        'Alerts',
        'Threshold and anomaly alerts with notification routing.',
        'Phase 5',
    ),
    createPlaceholderRoute(
        '/uptime',
        'Uptime',
        'Availability checks and downtime history.',
        'Phase 5',
    ),
    createPlaceholderRoute(
        '/integrations',
        'Integrations',
        'Slack, Microsoft Teams and Sentry connections.',
        'Phase 6',
    ),
    createPlaceholderRoute(
        '/billing',
        'Billing',
        'Plans, usage and checkout.',
        'Phase 7',
    ),
    createPlaceholderRoute(
        '/saved-filters',
        'Saved filters',
        'Reusable filter presets across dashboards.',
        'Phase 8',
    ),
    createPlaceholderRoute(
        '/notifications',
        'Notifications',
        'Dismissible in-app notifications.',
        'Phase 8',
    ),
    createPlaceholderRoute(
        '/admin',
        'Admin',
        'Internal administration tools.',
        'Phase 8',
    ),
];

/* ------------------------------ Route Tree -------------------------------- */

const routeTree = rootRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    verifyEmailRoute,
    authCallbackRoute,
    protectedRoute.addChildren([
        indexRoute,
        profileRoute,
        teamsRoute,
        teamDetailRoute,
        appsRoute,
        appDetailRoute,
        consumersRoute,
        consumerDetailRoute,
        consumerGroupsRoute,
        endpointsRoute,
        resourcesRoute,
        errorsRoute,
        trafficRoute,
        performanceRoute,
        logsRoute,
        ...scaffoldRoutes,
    ]),
]);

/* ------------------------------ Router Instance --------------------------- */

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
