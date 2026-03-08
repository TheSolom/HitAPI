import { Buffer } from 'node:buffer';
import type { JSONValue } from '@hitapi/types';
import { patternMatcher } from '../../common/utils/index.js';
import {
    MASK_QUERY_PARAM_PATTERNS,
    MASK_HEADER_PATTERNS,
    MASK_BODY_FIELD_PATTERNS,
    MASKED,
} from './constants/index.js';

export class DataMasker {
    maskQueryParams(search: string): string {
        const params = new URLSearchParams(search);
        for (const key of params.keys()) {
            if (patternMatcher(key, MASK_QUERY_PARAM_PATTERNS)) {
                params.set(key, MASKED);
            }
        }
        return params.toString();
    }

    maskHeaders(headers: [string, string][]): [string, string][] {
        return headers.map(([key, value]) => [
            key,
            patternMatcher(key, MASK_HEADER_PATTERNS) ? MASKED : value,
        ]);
    }

    maskBody(body: unknown): unknown {
        if (typeof body !== 'object' || body === null) {
            return body;
        }

        if (Array.isArray(body)) {
            return body.map((item) => this.maskBody(item));
        }

        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(body)) {
            if (
                typeof value === 'string' &&
                patternMatcher(key, MASK_BODY_FIELD_PATTERNS)
            ) {
                result[key] = MASKED;
            } else {
                result[key] = this.maskBody(value);
            }
        }
        return result;
    }

    maskJsonBody(bodyData: Buffer, contentType?: string): Buffer {
        try {
            if (!contentType) return bodyData;

            if (/\bjson\b/i.test(contentType)) {
                const parsedBody = JSON.parse(bodyData.toString()) as JSONValue;
                const maskedBody = this.maskBody(parsedBody);
                return Buffer.from(JSON.stringify(maskedBody));
            }

            if (/\bndjson\b/i.test(contentType)) {
                const lines = bodyData
                    .toString()
                    .split('\n')
                    .filter((line) => line.trim());

                const maskedLines = lines.map((line) => {
                    try {
                        const parsed = JSON.parse(line) as JSONValue;
                        const masked = this.maskBody(parsed);
                        return JSON.stringify(masked);
                    } catch {
                        return line;
                    }
                });

                return Buffer.from(maskedLines.join('\n'));
            }
        } catch {
            // If parsing fails, leave body as is
        }
        return bodyData;
    }
}
