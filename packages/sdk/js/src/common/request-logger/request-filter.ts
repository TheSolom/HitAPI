import type { Request } from '@hitapi/types';
import type { RequestLoggingConfig } from '../../common/types/config.js';
import { patternMatcher } from '../../common/utils/index.js';
import {
    EXCLUDE_PATH_PATTERNS,
    EXCLUDE_USER_AGENT_PATTERNS,
} from './constants/index.js';

export class RequestFilter {
    readonly #config: RequestLoggingConfig;

    constructor(config: RequestLoggingConfig) {
        this.#config = config;
    }

    shouldExcludePath(urlPath: string): boolean {
        const patterns = [
            ...this.#config.excludePaths,
            ...EXCLUDE_PATH_PATTERNS,
        ];
        return patternMatcher(urlPath, patterns);
    }

    shouldExcludeUserAgent(userAgent?: string): boolean {
        return userAgent
            ? patternMatcher(userAgent, EXCLUDE_USER_AGENT_PATTERNS)
            : false;
    }

    shouldLog(request: Request): boolean {
        const url = new URL(request.url);
        const path = request.path ?? url.pathname;
        const userAgent = request.headers.find(
            ([k]) => k.toLowerCase() === 'user-agent',
        )?.[1];

        return (
            !this.shouldExcludePath(path) &&
            !this.shouldExcludeUserAgent(userAgent)
        );
    }
}
