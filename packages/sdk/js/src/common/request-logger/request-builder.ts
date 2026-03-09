import { randomUUID } from 'node:crypto';
import { getContentType } from '@hitapi/shared/utils';
import type {
    Request,
    Response,
    LogRecord,
    RequestLogItem,
} from '@hitapi/types';
import type { RequestLoggingConfig } from '../../common/types/config.js';
import { DataMasker } from './data-masker.js';
import { isSupportedContentType, truncate } from '../../common/utils/index.js';
import { MAX_MSG_LENGTH } from '../../common/constants/server-error-counter.constant.js';
import { truncateExceptionStackTrace } from '../../common/core/server-error-counter.js';
import { MAX_LOG_MSG_LENGTH, MAX_BODY_SIZE } from './constants/index.js';

export class RequestLogItemBuilder {
    readonly #config: RequestLoggingConfig;
    readonly #dataMasker: DataMasker;

    constructor(config: RequestLoggingConfig, dataMasker: DataMasker) {
        this.#config = config;
        this.#dataMasker = dataMasker;
    }

    #createExceptionLog(error: Error) {
        if (!this.#config.logException) return undefined;

        return {
            type: error.name,
            message: truncate(error.message, MAX_MSG_LENGTH),
            stacktrace: truncateExceptionStackTrace(error.stack ?? ''),
        };
    }

    #createLogRecords(logs: LogRecord[]) {
        if (!logs?.length) return undefined;

        return logs.map((log) => ({
            timestamp: log.timestamp,
            logger: log.logger,
            level: log.level,
            message: truncate(log.message, MAX_LOG_MSG_LENGTH),
        }));
    }

    #prepareBodyData(
        body: Buffer | undefined,
        shouldLog: boolean,
        contentType: string,
    ): Buffer | undefined {
        if (!shouldLog || !body || !isSupportedContentType(contentType)) {
            return undefined;
        }

        return truncate(body, MAX_BODY_SIZE);
    }

    build(
        request: Request,
        response: Response,
        error?: Error,
        logs?: LogRecord[],
        traceId?: string,
    ): RequestLogItem {
        const requestBody = this.#prepareBodyData(
            request.body,
            this.#config.logRequestBody,
            getContentType(request.headers) as string,
        );

        const responseBody = this.#prepareBodyData(
            response.body,
            this.#config.logResponseBody,
            getContentType(response.headers) as string,
        );

        const item: RequestLogItem = {
            uuid: randomUUID(),
            request: {
                ...request,
                body: requestBody,
                size:
                    request.size && request.size >= 0
                        ? request.size
                        : undefined,
            },
            response: {
                ...response,
                body: responseBody,
                size:
                    response.size && response.size >= 0
                        ? response.size
                        : undefined,
            },
            exception: error ? this.#createExceptionLog(error) : undefined,
            logs: logs ? this.#createLogRecords(logs) : undefined,
            traceId,
        };

        return this.#applyMasking(item);
    }

    #applyMasking(item: RequestLogItem): RequestLogItem {
        const maskedItem = { ...item };

        if (maskedItem.request.body) {
            const contentType = getContentType(maskedItem.request.headers);
            maskedItem.request.body = this.#dataMasker.maskJsonBody(
                maskedItem.request.body,
                contentType,
            );
        }

        if (maskedItem.response.body) {
            const contentType = getContentType(maskedItem.response.headers);
            maskedItem.response.body = this.#dataMasker.maskJsonBody(
                maskedItem.response.body,
                contentType,
            );
        }

        maskedItem.request.headers = this.#config.logRequestHeaders
            ? this.#dataMasker.maskHeaders(maskedItem.request.headers)
            : [];

        maskedItem.response.headers = this.#config.logResponseHeaders
            ? this.#dataMasker.maskHeaders(maskedItem.response.headers)
            : [];

        const url = new URL(maskedItem.request.url);
        if (this.#config.logQueryParams) {
            url.search = this.#dataMasker.maskQueryParams(url.search);
            maskedItem.request.url = url.toString();
        }

        return maskedItem;
    }
}
