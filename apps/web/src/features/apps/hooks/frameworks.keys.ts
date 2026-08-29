export const frameworkKeys = {
    all: ['frameworks'] as const,
    lists: () => [...frameworkKeys.all, 'list'] as const,
    details: () => [...frameworkKeys.all, 'detail'] as const,
    detail: (id: number) => [...frameworkKeys.details(), id] as const,
};
