import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder, type QueryRunner } from 'typeorm';
import type {
    IRequestLogsRepository,
    PartialRequestLog,
    TimelineRawResult,
    RequestLogFilterCriteria,
} from '../interfaces/request-logs-repository.interface.js';
import { RequestLog } from '../entities/request-log.entity.js';
import { parsePeriod } from '../../../common/utils/period.util.js';
import type { FindOptions } from '../../../common/types/find-options.type.js';
import type { NullableType } from '../../../common/types/nullable.type.js';
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

    private applyPeriodFilter(
        qb: SelectQueryBuilder<RequestLog>,
        criteria: RequestLogFilterCriteria,
    ): void {
        if (!criteria.period) return;

        const periodTimestamp = parsePeriod(criteria.period);

        if (periodTimestamp instanceof Date) {
            qb.andWhere('rl.timestamp >= :periodTimestamp', {
                periodTimestamp: periodTimestamp.toISOString(),
            });
        } else {
            qb.andWhere('rl.timestamp BETWEEN :startDate AND :endDate', {
                startDate: periodTimestamp.startDate.toISOString(),
                endDate: periodTimestamp.endDate.toISOString(),
            });
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

            if (value !== undefined && value !== null) {
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
        this.applyPeriodFilter(qb, criteria);
    }

    async createRequestLogs(
        createRequestLogsDto: CreateRequestLogDto[],
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(RequestLog)
            : this.requestLogRepository;

        const entities = createRequestLogsDto.map((dto) =>
            repository.create({
                ...dto,
                app: { id: dto.appId },
                consumer: { id: dto.consumerId },
            }),
        );

        await repository.insert(entities);
    }

    async findWithFilters(
        criteria: RequestLogFilterCriteria,
        pagination: Pick<FindOptions, 'order' | 'skip' | 'take'>,
    ): Promise<{ items: PartialRequestLog[]; totalItems: number }> {
        const qb = this.requestLogRepository
            .createQueryBuilder('rl')
            .select([
                'rl.requestUuid as "requestUuid"',
                'rl.method as "method"',
                'rl.path as "path"',
                'rl.url as "url"',
                'rl.requestSize as "requestSize"',
                'rl.statusCode as "statusCode"',
                'rl.statusText as "statusText"',
                'rl.responseTime as "responseTime"',
                'rl.responseSize as "responseSize"',
                'rl.clientIp as "clientIp"',
                'rl.clientCountryCode as "clientCountryCode"',
                'rl.consumerId as "consumerId"',
                'c.identifier as "consumerIdentifier"',
                'c.name as "consumerName"',
                'rl.traceId as "traceId"',
                'rl.timestamp as "timestamp"',
            ])
            .leftJoin('rl.consumer', 'c')
            .where({ app: { id: criteria.appId } })
            .orderBy('rl.timestamp', pagination.order)
            .skip(pagination.skip)
            .take(pagination.take);

        this.applyFilters(qb, criteria);

        const [items, totalItems] = await Promise.all([
            qb.getRawMany<PartialRequestLog>(),
            qb.clone().getCount(),
        ]);

        return { items, totalItems };
    }

    async findTimelineData(
        criteria: RequestLogFilterCriteria,
    ): Promise<TimelineRawResult[]> {
        const qb = this.requestLogRepository
            .createQueryBuilder('rl')
            .select("DATE_TRUNC('hour', rl.timestamp)", 'timeWindow')
            .addSelect('COUNT(*)', 'itemCount')
            .leftJoin('rl.consumer', 'c')
            .where({ app: { id: criteria.appId } })
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
            .where('rl.requestUuid = :requestUuid', { requestUuid })
            .andWhere({ app: { id: appId } });

        if (timestamp) {
            qb.andWhere('rl.timestamp = :timestamp', { timestamp });
        }

        return qb.getOne();
    }
}
