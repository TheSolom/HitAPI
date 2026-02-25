import { getContentType } from '@hitapi/shared/utils';
import { getCountryName } from '../../../common/utils/country.util.js';
import type { RequestLogResponseDto } from '../dto/request-log-response.dto.js';
import type { RequestLogDetailsResponseDto } from '../dto/request-log-details-response.dto.js';
import type { RequestLog } from '../entities/request-log.entity.js';
import type { PartialRequestLog } from '../interfaces/request-logs-repository.interface.js';
import type { LogCountByLevel } from '../interfaces/log-count-by-level.interface.js';

export class RequestLogMapper {
    static toRequestLogResponseDto(
        items: PartialRequestLog[],
        logCountMap: Map<string, Record<string, number>>,
    ): RequestLogResponseDto[] {
        return items.map((item) => ({
            requestUuid: item.requestUuid,
            method: item.method,
            path: item.path,
            url: item.url,
            statusCode: item.statusCode,
            statusText: item.statusText,
            responseTime: item.responseTime,
            timestamp: item.timestamp,
            requestSize: item.requestSize ?? undefined,
            responseSize: item.responseSize ?? undefined,
            clientIp: item.clientIp ?? undefined,
            clientCountryCode: item.clientCountryCode ?? undefined,
            clientCountryName: item.clientCountryCode
                ? getCountryName(item.clientCountryCode)
                : undefined,
            consumerId: item.consumerId ?? undefined,
            consumerIdentifier: item.consumerIdentifier ?? undefined,
            consumerName: item.consumerName ?? undefined,
            applicationLogsCountByLevel:
                logCountMap.get(item.requestUuid) ?? {},
        }));
    }

    static toRequestLogDetailsResponseDto(
        log: RequestLog,
        logsCount: number,
        logCountByLevel: Record<string, number>,
    ): RequestLogDetailsResponseDto {
        return {
            requestUuid: log.requestUuid,
            method: log.method,
            path: log.path,
            url: log.url,
            statusCode: log.statusCode,
            statusText: log.statusText,
            requestHeaders: log.requestHeaders,
            requestContentType: getContentType(log.requestHeaders) ?? 'Unknown',
            responseTime: log.responseTime,
            responseHeaders: log.responseHeaders,
            responseContentType:
                getContentType(log.responseHeaders) ?? 'Unknown',
            timestamp: log.timestamp,
            requestSize: log.requestSize ?? undefined,
            requestBody: log.requestBody?.toString() ?? undefined,
            responseSize: log.responseSize ?? undefined,
            responseBody: log.responseBody?.toString() ?? undefined,
            clientIp: log.clientIp ?? undefined,
            clientCountryCode: log.clientCountryCode ?? undefined,
            clientCountryName: log.clientCountryCode
                ? getCountryName(log.clientCountryCode)
                : undefined,
            exceptionType: log.exceptionType ?? undefined,
            exceptionMessage: log.exceptionMessage ?? undefined,
            exceptionStacktrace: log.exceptionStacktrace ?? undefined,
            consumerId: log.consumer?.id,
            consumerIdentifier: log.consumer?.identifier,
            consumerName: log.consumer?.name ?? undefined,
            traceId: log.traceId ?? undefined,
            applicationLogsCountByLevel: logCountByLevel,
            applicationLogsCount: logsCount,
        };
    }

    static buildLogCountMap(
        logCounts: LogCountByLevel[],
    ): Map<string, Record<string, number>> {
        const logCountMap = new Map<string, Record<string, number>>();

        for (const lc of logCounts) {
            if (!logCountMap.has(lc.requestUuid)) {
                logCountMap.set(lc.requestUuid, {});
            }

            const countMap = logCountMap.get(lc.requestUuid);
            if (countMap) {
                countMap[lc.level] = Number.parseInt(lc.count, 10);
            }
        }

        return logCountMap;
    }

    static buildLogCountByLevel(
        logsByLevel: { level: string; count: string }[],
    ): Record<string, number> {
        const logCountByLevel: Record<string, number> = {};

        for (const l of logsByLevel) {
            logCountByLevel[l.level] = Number.parseInt(l.count, 10);
        }

        return logCountByLevel;
    }
}
