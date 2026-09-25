import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder, type QueryRunner } from 'typeorm';
import { type NullableType, OrderDirection, type Period } from '@hitapi/types';
import type {
    IRequestLogsRepository,
    PartialRequestLog,
    TimelineRawResult,
    RequestLogFilterCriteria,
    AppMetricsRawResult,
    RequestLogPaginationOptions,
} from '../interfaces/request-logs-repository.interface.js';
import { RequestLog } from '../entities/request-log.entity.js';
import {
    applyPeriodFilter,
    parsePeriod,
} from '../../../common/utils/period.util.js';
import {
    encodeCursor,
    type RequestLogCursorPayload,
} from '../../../common/helpers/cursor.helper.js';
import type { CreateRequestLogDto } from '../dto/create-request-log.dto.js';

@Injectable()
export class RequestLogsRepository
    extends Repository<RequestLog>
    implements IRequestLogsRepository
{
    constructor(
        @InjectRepository(RequestLog)
        private readonly requestLogRepository: Repository<RequestLog>,
    ) {
        super(
            requestLogRepository.target,
            requestLogRepository.manager,
            requestLogRepository.queryRunner,
        );
    }

    private applyPathFilter(
        qb: SelectQueryBuilder<RequestLog>,
        criteria: RequestLogFilterCriteria,
    ): void {
        if (!criteria.path) return;

        if (criteria.pathExact) {
            qb.andWhere('rl.path = :path', { path: criteria.path });
        } else {
            qb.andWhere('rl.path LIKE :path', { path: `%${criteria.path}%` });
        }
    }

    private applyFilters(
        qb: SelectQueryBuilder<RequestLog>,
        criteria: RequestLogFilterCriteria,
    ): void {
        // prettier-ignore
        const simpleFilters: Array<{
            key: keyof RequestLogFilterCriteria;
            column: string;
            operator: '=' | '>=' | '<=' | 'LIKE' | 'ILIKE';
            wrapLike?: boolean;
        }> = [
            { key: 'consumerId',      column: 'rl.consumerId',   operator: '='                     },
            { key: 'consumerGroupId', column: 'c.groupId',       operator: '='                     },
            { key: 'method',          column: 'rl.method',       operator: '='                     },
            { key: 'statusCode',      column: 'rl.statusCode',   operator: '='                     },
            { key: 'url',             column: 'rl.url',          operator: 'ILIKE', wrapLike: true },
            { key: 'minRequestSize',  column: 'rl.requestSize',  operator: '>='                    },
            { key: 'maxRequestSize',  column: 'rl.requestSize',  operator: '<='                    },
            { key: 'minResponseSize', column: 'rl.responseSize', operator: '>='                    },
            { key: 'maxResponseSize', column: 'rl.responseSize', operator: '<='                    },
            { key: 'minResponseTime', column: 'rl.responseTime', operator: '>='                    },
            { key: 'maxResponseTime', column: 'rl.responseTime', operator: '<='                    },
            { key: 'requestBody',     column: 'rl.requestBody',  operator: 'LIKE',  wrapLike: true },
            { key: 'responseBody',    column: 'rl.responseBody', operator: 'LIKE',  wrapLike: true },
            { key: 'clientIp',        column: 'rl.clientIp',     operator: '='                     },
            { key: 'minTimestamp',    column: 'rl.timestamp',    operator: '>='                    },
            { key: 'maxTimestamp',    column: 'rl.timestamp',    operator: '<='                    },
        ];

        if (criteria.logLevel) {
            qb.andWhere(
                `EXISTS (
                    SELECT 1 FROM application_log al
                    WHERE al."requestUuid" = rl."requestUuid"
                    AND al.level = :logLevel
                )`,
                { logLevel: criteria.logLevel },
            );
        }

        for (const filter of simpleFilters) {
            const value = criteria[filter.key];

            if (value !== undefined) {
                const paramValue = filter.wrapLike
                    ? `%${String(value)}%`
                    : value;

                qb.andWhere(
                    `${filter.column} ${filter.operator} :${filter.key}`,
                    {
                        [filter.key]: paramValue,
                    },
                );
            }
        }

        this.applyPathFilter(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );
    }

    async createRequestLogs(
        createRequestLogsDto: CreateRequestLogDto[],
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(RequestLog)
            : this.requestLogRepository;

        const entities = createRequestLogsDto.map((dto) => {
            const entity = repository.create({
                app: { id: dto.appId },
                consumer: { id: dto.consumerId },
            });
            return Object.assign(entity, dto);
        });

        await repository.insert(entities);
    }

    private applyKeysetPagination(
        qb: SelectQueryBuilder<RequestLog>,
        order: OrderDirection,
        cursor?: RequestLogCursorPayload | null,
        skip?: number,
    ): void {
        if (cursor) {
            const cursorTimestamp = new Date(cursor.timestamp);
            const cursorUuid = cursor.requestUuid;

            const operator = order === OrderDirection.DESC ? '<' : '>';
            qb.andWhere(
                `(rl.timestamp ${operator} :cursorTimestamp OR (rl.timestamp = :cursorTimestamp AND rl.requestUuid ${operator} :cursorUuid))`,
                { cursorTimestamp, cursorUuid },
            );
        } else if (skip && skip > 0) {
            qb.offset(skip);
        }
    }

    private projectPartialRequestLog(
        qb: SelectQueryBuilder<RequestLog>,
        order: OrderDirection,
        take: number,
    ): void {
        qb.select([
            'rl.requestUuid AS "requestUuid"',
            'rl.method AS "method"',
            'rl.path AS "path"',
            'rl.url AS "url"',
            'rl.requestSize AS "requestSize"',
            'rl.statusCode AS "statusCode"',
            'rl.statusText AS "statusText"',
            'rl.responseTime AS "responseTime"',
            'rl.responseSize AS "responseSize"',
            'rl.clientIp AS "clientIp"',
            'rl.clientCountryCode AS "clientCountryCode"',
            'rl.consumerId AS "consumerId"',
            'c.identifier AS "consumerIdentifier"',
            'c.name AS "consumerName"',
            'cg.name AS "consumerGroupName"',
            'rl.traceId AS "traceId"',
            'rl.timestamp AS "timestamp"',
        ])
            .orderBy('rl.timestamp', order)
            .addOrderBy('rl.requestUuid', order)
            .limit(take + 1);
    }

    private buildNextCursor(
        hasNextPage: boolean,
        items: PartialRequestLog[],
    ): string | null {
        if (!hasNextPage || items.length === 0) return null;

        const lastItem = items[items.length - 1];
        const tsStr =
            typeof lastItem.timestamp === 'string'
                ? lastItem.timestamp
                : lastItem.timestamp.toISOString();

        return encodeCursor({
            timestamp: tsStr,
            requestUuid: lastItem.requestUuid,
        });
    }

    private async resolveTotalCount(
        criteria: RequestLogFilterCriteria,
        rawItemsCount: number,
        take: number,
        cursor?: RequestLogCursorPayload | null,
        skip?: number,
    ): Promise<number> {
        const isFirstPageWithoutCursor = !cursor && (!skip || skip === 0);
        if (isFirstPageWithoutCursor && rawItemsCount <= take) {
            return rawItemsCount;
        }

        const countQb = this.requestLogRepository
            .createQueryBuilder('rl')
            .where({ app: { id: criteria.appId } });

        if (criteria.consumerGroupId) {
            countQb.leftJoin('rl.consumer', 'c');
        }

        this.applyFilters(countQb, criteria);
        return countQb.getCount();
    }

    async findWithFilters(
        criteria: RequestLogFilterCriteria,
        pagination: RequestLogPaginationOptions,
    ): Promise<{
        items: PartialRequestLog[];
        totalItems: number;
        hasNextPage: boolean;
        nextCursor?: string | null;
    }> {
        const order = pagination.order ?? OrderDirection.DESC;
        const take = pagination.take;

        const qb = this.requestLogRepository
            .createQueryBuilder('rl')
            .leftJoin('rl.consumer', 'c')
            .leftJoin('c.group', 'cg')
            .where({ app: { id: criteria.appId } });

        this.applyFilters(qb, criteria);
        this.applyKeysetPagination(
            qb,
            order,
            pagination.cursor,
            pagination.skip,
        );
        this.projectPartialRequestLog(qb, order, take);

        const rawItems = await qb.getRawMany<PartialRequestLog>();
        const hasNextPage = rawItems.length > take;
        const items = hasNextPage ? rawItems.slice(0, take) : rawItems;
        const nextCursor = this.buildNextCursor(hasNextPage, items);

        const totalItems = await this.resolveTotalCount(
            criteria,
            rawItems.length,
            take,
            pagination.cursor,
            pagination.skip,
        );

        return { items, totalItems, hasNextPage, nextCursor };
    }

    async findTimelineData(
        criteria: RequestLogFilterCriteria,
    ): Promise<TimelineRawResult[]> {
        const qb = this.requestLogRepository
            .createQueryBuilder('rl')
            .select("DATE_TRUNC('hour', rl.timestamp)", 'timeWindow')
            .addSelect('COUNT(*)', 'itemCount')
            .where({ app: { id: criteria.appId } })
            .leftJoin('rl.consumer', 'c')
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC');

        this.applyFilters(qb, criteria);

        return qb.getRawMany<TimelineRawResult>();
    }

    async findByRequestUuid(
        requestUuid: string,
        appId: string,
        timestamp?: string,
    ): Promise<NullableType<RequestLog>> {
        const qb = this.requestLogRepository
            .createQueryBuilder('rl')
            .leftJoinAndSelect('rl.consumer', 'c')
            .leftJoinAndSelect('c.group', 'cg')
            .where('rl.requestUuid = :requestUuid', { requestUuid })
            .andWhere({ app: { id: appId } });

        if (timestamp) {
            qb.andWhere('rl.timestamp = :timestamp', { timestamp });
        }

        return qb.getOne();
    }

    async getAppMetrics(
        appId: string,
        period: Period,
        targetResponseTimeMs: number,
    ): Promise<AppMetricsRawResult> {
        const toleratingMs = targetResponseTimeMs * 4;

        const qb = this.requestLogRepository
            .createQueryBuilder('rl')
            .select([
                'COUNT(*) AS "requestCount"',
                'SUM(CASE WHEN rl.statusCode >= 400 THEN 1 ELSE 0 END) AS "errorCount"',
                'SUM(CASE WHEN rl.statusCode < 400 AND rl.responseTime <= :targetResponseTimeMs THEN 1 ELSE 0 END) AS "satisfiedCount"',
                'SUM(CASE WHEN rl.statusCode < 400 AND rl.responseTime > :targetResponseTimeMs AND rl.responseTime <= :toleratingMs THEN 1 ELSE 0 END) AS "toleratingCount"',
                'COUNT(DISTINCT rl.consumerId) AS "consumerCount"',
            ])
            .where('rl.appId = :appId', {
                appId,
                targetResponseTimeMs,
                toleratingMs,
            });

        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(period),
            'rl',
            'timestamp',
        );

        const result = await qb.getRawOne<AppMetricsRawResult>();

        return {
            requestCount: result?.requestCount ?? '0',
            errorCount: result?.errorCount ?? '0',
            satisfiedCount: result?.satisfiedCount ?? '0',
            toleratingCount: result?.toleratingCount ?? '0',
            consumerCount: result?.consumerCount ?? '0',
        };
    }
}
