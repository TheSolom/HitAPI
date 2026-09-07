export interface RateLimitResult {
    isAllowed: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
    retryAfterSeconds: number;
}
