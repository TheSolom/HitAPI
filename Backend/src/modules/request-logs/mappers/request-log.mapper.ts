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
            requestSize: item.requestSize,
            statusCode: item.statusCode,
            statusText: item.statusText,
            responseTime: item.responseTime,
            responseSize: item.responseSize,
            clientIp: item.clientIp,
            clientCountryCode: item.clientCountryCode,
            clientCountryName: getCountryName(item.clientCountryCode),
            applicationLogsCountByLevel:
                logCountMap.get(item.requestUuid) ?? {},
            consumerId: item.consumerId,
            consumerName: item.consumerName,
            timestamp: item.timestamp,
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
            requestSize: log.requestSize,
            statusCode: log.statusCode,
            statusText: log.statusText,
            responseTime: log.responseTime,
            responseSize: log.responseSize,
            clientIp: log.clientIp,
            clientCountryCode: log.clientCountryCode,
            clientCountryName: getCountryName(log.clientCountryCode),
            applicationLogsCountByLevel: logCountByLevel,
            requestHeaders: Object.entries(log.requestHeaders ?? {}),
            requestContentType: log.requestHeaders['content-type'],
            requestBody: log.requestBody,
            responseHeaders: Object.entries(log.responseHeaders ?? {}),
            responseContentType: log.responseHeaders['content-type'],
            responseBody: log.responseBody,
            exceptionType: log.exceptionType,
            exceptionMessage: log.exceptionMessage,
            exceptionStacktrace: log.exceptionStacktrace,
            applicationLogsCount: logsCount,
            consumerId: log.consumer.id,
            consumerName: log.consumer.name,
            timestamp: log.timestamp,
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
