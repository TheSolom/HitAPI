import { RestfulMethod } from '@hitapi/shared/enums';

export function getMethodBadgeClass(method: RestfulMethod): string {
    switch (method) {
        case RestfulMethod.GET:
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
        case RestfulMethod.POST:
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
        case RestfulMethod.PUT:
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
        case RestfulMethod.PATCH:
            return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
        case RestfulMethod.DELETE:
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}
