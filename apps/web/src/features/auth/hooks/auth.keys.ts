export const authKeys = {
    all: ['auth'] as const,
    currentUser: () => ['auth', 'current-user'] as const,
    sessions: () => ['auth', 'sessions'] as const,
    socialAccounts: () => ['auth', 'social-accounts'] as const,
};
