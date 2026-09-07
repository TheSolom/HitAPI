import { RateLimitType } from '../enums/rate-limit.enum.js';
import type { RateLimitConfig } from '../interfaces/rate-limit-config.interface.js';

export const DEFAULT_RATE_LIMIT_CONFIGS: Record<
    RateLimitType,
    RateLimitConfig
> = {
    [RateLimitType.EMAIL_VERIFICATION]: {
        maxRequests: 3,
        windowMs: 300_000,
    },
    [RateLimitType.PASSWORD_RESET]: {
        maxRequests: 3,
        windowMs: 300_000,
    },
    [RateLimitType.LOGIN_ATTEMPT]: {
        maxRequests: 5,
        windowMs: 900_000,
    },
    [RateLimitType.API_CALL]: {
        maxRequests: 100,
        windowMs: 60_000,
    },
};

export const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])
local clearBefore = now - windowMs

redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
local currentRequests = redis.call('ZCARD', key)

if currentRequests < maxRequests then
    redis.call('ZADD', key, now, now .. ':' .. math.random(1000000))
    redis.call('PEXPIRE', key, windowMs)
    local remaining = maxRequests - currentRequests - 1
    return {1, remaining, windowMs, 0}
else
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local resetMs = windowMs
    if oldest and oldest[2] then
        resetMs = math.max(0, tonumber(oldest[2]) + windowMs - now)
    end
    local retryAfter = math.max(1, math.ceil(resetMs / 1000))
    return {0, 0, resetMs, retryAfter}
end
`;
