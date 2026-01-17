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
            responseTime: item.responseTime,
            responseSize: item.responseSize,
            applicationLogsCountByLevel: logCountMap.get(item.requestUuid),
            timestamp: item.timestamp,
            statusText: item.statusText,
            requestSize: item.requestSize,
            clientIp: item.clientIp,
            clientCountryCode: item.clientCountryCode,
            clientCountryName: getCountryName(item.clientCountryCode),
            consumerId: item.consumerId ?? undefined,
            consumerName: item.consumerName ?? undefined,
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
            responseTime: log.responseTime,
            responseSize: log.responseSize,
            applicationLogsCountByLevel: logCountByLevel,
            applicationLogsCount: logsCount,
            timestamp: log.timestamp,
            statusText: log.statusText ?? undefined,
            requestSize: log.requestSize ?? undefined,
            clientIp: log.clientIp ?? undefined,
            clientCountryCode: log.clientCountryCode ?? undefined,
            clientCountryName: log.clientCountryCode
                ? getCountryName(log.clientCountryCode)
                : undefined,
            requestHeaders: log.requestHeaders ?? undefined,
            requestContentType:
                log.requestHeaders?.['content-type'] ?? undefined,
            requestBody: log.requestBody ?? undefined,
            responseHeaders: log.responseHeaders ?? undefined,
            responseContentType:
                log.responseHeaders?.['content-type'] ?? undefined,
            responseBody: log.responseBody ?? undefined,
            exceptionType: log.exceptionType ?? undefined,
            exceptionMessage: log.exceptionMessage ?? undefined,
            exceptionStacktrace: log.exceptionStacktrace ?? undefined,
            consumerId: log.consumer?.id,
            consumerName: log.consumer?.name ?? undefined,
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
