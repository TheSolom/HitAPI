import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
    type SelectQueryBuilder,
    type ObjectLiteral,
} from 'typeorm';
import type {
    IErrorsRepository,
    IErrorMetric,
    IErrorChart,
    IErrorByConsumerChart,
    IErrorRateChart,
    IErrorTable,
    IErrorDetails,
} from '../interfaces/errors-repository.interface.js';
import { ErrorMetric } from '../entities/error-metric.entity.js';
import { ValidationError } from '../entities/validation-error.entity.js';
import { ServerError } from '../entities/server-error.entity.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { RequestLogsRepository } from '../../request-logs/repositories/request-logs.repository.js';
import { RequestLog } from '../../request-logs/entities/request-log.entity.js';
import {
    parsePeriod,
    applyPeriodFilter,
} from '../../../common/utils/period.util.js';
import type { MaybeType } from '../../../common/types/maybe.type.js';
import type { GetErrorOptionsDto } from '../dto/get-error-options.dto.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { ValidationErrorsTableResponseDto } from '../dto/validation-errors-table-response.dto.js';
import type { ServerErrorsTableResponseDto } from '../dto/server-errors-table-response.dto.js';

@Injectable()
export class ErrorsRepository implements IErrorsRepository {
    constructor(
        @InjectRepository(ErrorMetric)
        private readonly errorMetricsRepository: Repository<ErrorMetric>,
        @InjectRepository(ValidationError)
        private readonly validationErrorsRepository: Repository<ValidationError>,
        @InjectRepository(ServerError)
        private readonly serverErrorsRepository: Repository<ServerError>,
        @Inject(Repositories.REQUEST_LOGS)
        private readonly requestLogsRepository: RequestLogsRepository,
    ) {}

    private applyPathFilter<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        { path, pathExact }: GetErrorOptionsDto,
    ): void {
        if (!path) return;

        if (pathExact) {
            qb.andWhere('rl.path = :path', { path });
        } else {
            qb.andWhere('rl.path LIKE :path', { path: `%${path}%` });
        }
    }

    private applyFilters<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        criteria: GetErrorOptionsDto,
    ): void {
        if (criteria.consumerId) {
            qb.andWhere('rl.consumerId = :consumerId', {
                consumerId: criteria.consumerId,
            });
        }
        if (criteria.consumerGroupId) {
            qb.andWhere(
                'rl.consumerId IN (SELECT id FROM consumers WHERE groupId = :groupId)',
                {
                    groupId: criteria.consumerGroupId,
                },
            );
        }
        if (criteria.method) {
            qb.andWhere('rl.method = :method', { method: criteria.method });
        }
        if (criteria.statusCode) {
            const match = /^([1-5])xx$/.exec(criteria.statusCode);
            if (match) {
                const start = Number.parseInt(match[1]) * 100;
                qb.andWhere('rl.statusCode BETWEEN :start AND :end', {
                    start: start,
                    end: start + 99,
                });
            } else {
                qb.andWhere('rl.statusCode = :statusCode', {
                    statusCode: Number.parseInt(criteria.statusCode),
                });
            }
        }

        this.applyPathFilter(qb, criteria);
    }

    async getErrorMetrics(
        criteria: Pick<GetErrorOptionsDto, 'appId' | 'period'>,
    ): Promise<MaybeType<Omit<IErrorMetric, 'totalRequestCount'>>> {
        const qb = this.errorMetricsRepository
            .createQueryBuilder('em')
            .select([
                'SUM(em.clientErrorCount + em.serverErrorCount) AS "totalErrorCount"',
                'SUM(em.clientErrorCount) AS "clientErrorCount"',
                'SUM(em.serverErrorCount) AS "serverErrorCount"',
            ])
            .where({ app: { id: criteria.appId } });

        applyPeriodFilter<ErrorMetric>(
            qb,
            parsePeriod(criteria.period),
            'em',
            'timeWindow',
        );

        return qb.getRawOne<Omit<IErrorMetric, 'totalRequestCount'>>();
    }

    async getErrorMetricsFiltered(
        criteria: GetErrorOptionsDto,
    ): Promise<MaybeType<IErrorMetric>> {
        const qb = this.requestLogsRepository
            .createQueryBuilder('rl')
            .select([
                'COUNT(*) AS "totalRequestCount"',
                'SUM(CASE WHEN rl.statusCode >= 400 THEN 1 ELSE 0 END) AS "totalErrorCount"',
                'SUM(CASE WHEN rl.statusCode >= 400 AND rl.statusCode < 500 THEN 1 ELSE 0 END) AS "clientErrorCount"',
                'SUM(CASE WHEN rl.statusCode >= 500 THEN 1 ELSE 0 END) AS "serverErrorCount"',
            ])
            .where({ app: { id: criteria.appId } });

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb.getRawOne<IErrorMetric>();
    }

    async getErrorsChart(
        criteria: GetErrorOptionsDto,
    ): Promise<{ clientErrors: IErrorChart[]; serverErrors: IErrorChart[] }> {
        const qb = this.requestLogsRepository
            .createQueryBuilder('rl')
            .where({ app: { id: criteria.appId } })
            .andWhere('rl.statusCode >= 400');

        this.applyFilters<RequestLog>(qb, criteria);
        const period = parsePeriod(criteria.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        const clientErrors = qb
            .clone()
            .andWhere('rl.statusCode < 500')
            .select([
                `DATE_TRUNC('${period.granularity}', rl.timestamp) AS "timeWindow"`,
                'COUNT(*) AS "requestCount"',
                'rl.statusCode AS "statusCode"',
            ])
            .groupBy('"timeWindow", rl.statusCode')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IErrorChart>();

        const serverErrors = qb
            .clone()
            .andWhere('rl.statusCode >= 500')
            .select([
                `DATE_TRUNC('${period.granularity}', rl.timestamp) AS "timeWindow"`,
                'COUNT(*) AS "requestCount"',
                'rl.statusCode AS "statusCode"',
            ])
            .groupBy('"timeWindow", rl.statusCode')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IErrorChart>();

        return Promise.all([clientErrors, serverErrors]).then(
            ([clientErrors, serverErrors]) => ({ clientErrors, serverErrors }),
        );
    }

    async getErrorsByConsumerChart(
        criteria: GetErrorOptionsDto,
    ): Promise<IErrorByConsumerChart[]> {
        const qb = this.requestLogsRepository
            .createQueryBuilder('rl')
            .select([
                'c.id AS "consumerId"',
                'COALESCE(c.name, c.identifier) AS "consumerName"',
                'COUNT(*) AS "requestCount"',
            ])
            .where({ app: { id: criteria.appId } })
            .andWhere('rl.statusCode >= 400')
            .innerJoin('rl.consumer', 'c')
            .groupBy('c.id')
            .addGroupBy('"consumerName"')
            .orderBy('"requestCount"', 'DESC')
            .limit(10);

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb.getRawMany<IErrorByConsumerChart>();
    }

    async getErrorRatesChart(criteria: GetErrorOptionsDto) {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');
        const period = parsePeriod(criteria.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        const totals = qb
            .clone()
            .select([
                `DATE_TRUNC('${period.granularity}', rl.timestamp) AS "timeWindow"`,
                'COUNT(*) AS "totalCount"',
            ])
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<{ timeWindow: Date; totalCount: string }>();

        const clientErrors = qb
            .clone()
            .select([
                `DATE_TRUNC('${period.granularity}', rl.timestamp) AS "timeWindow"`,
                'COUNT(*) AS "errorCount"',
            ])
            .andWhere('rl.statusCode >= 400 AND rl.statusCode < 500')
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IErrorRateChart>();

        const serverErrors = qb
            .clone()
            .select([
                `DATE_TRUNC('${period.granularity}', rl.timestamp) AS "timeWindow"`,
                'COUNT(*) AS "errorCount"',
            ])
            .andWhere('rl.statusCode >= 500')
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IErrorRateChart>();

        return Promise.all([totals, clientErrors, serverErrors]).then(
            ([totals, clientErrors, serverErrors]) => {
                return {
                    totals: new Map(
                        totals.map((t) => [
                            t.timeWindow.toISOString(),
                            Number.parseInt(t.totalCount),
                        ]),
                    ),
                    clientErrors,
                    serverErrors,
                };
            },
        );
    }

    async getErrorsTable(criteria: GetErrorOptionsDto): Promise<IErrorTable[]> {
        const qb = this.requestLogsRepository
            .createQueryBuilder('rl')
            .select([
                'e.id AS "id"',
                'rl.method AS "method"',
                'rl.path AS "path"',
                'rl.statusCode AS "statusCode"',
                'COUNT(*) AS "requestCount"',
                'COUNT(DISTINCT rl.consumerId) AS "affectedConsumers"',
            ])
            .innerJoin('rl.app', 'a')
            .leftJoin(
                'a.endpoints',
                'e',
                'e.method = rl.method AND e.path = rl.path',
            )
            .where({ app: { id: criteria.appId } })
            .andWhere('rl.statusCode >= 400')
            .groupBy('e.id, rl.method, rl.path, rl.statusCode')
            .orderBy('"requestCount"', 'DESC')
            .addOrderBy('"affectedConsumers"', 'DESC');

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb.getRawMany<IErrorTable>();
    }

    async getErrorDetails(
        criteria: GetErrorOptionsDto,
    ): Promise<MaybeType<IErrorDetails>> {
        const qb = this.requestLogsRepository
            .createQueryBuilder('rl')
            .select([
                'COUNT(*) AS "requestCount"',
                'COUNT(DISTINCT rl.consumerId) AS "affectedConsumers"',
                'MAX(rl.timestamp) AS "lastTimestamp"',
            ])
            .where({ app: { id: criteria.appId } })
            .andWhere('rl.statusCode >= 400');

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb.getRawOne<IErrorDetails>();
    }

    async getValidationErrorsTable(
        criteria: GetValidationAndServerErrorOptionsDto,
    ): Promise<ValidationErrorsTableResponseDto[]> {
        const qb = this.validationErrorsRepository
            .createQueryBuilder('ve')
            .select([
                've.msg AS "msg"',
                've.type AS "type"',
                've.loc AS "loc"',
                've.errorCount AS "errorCount"',
            ])
            .orderBy('ve.errorCount', 'DESC')
            .limit(criteria.limit);

        this.applyFilters<ValidationError>(qb, criteria);
        applyPeriodFilter<ValidationError>(
            qb,
            parsePeriod(criteria.period),
            've',
            'timestamp',
        );

        return qb.getMany();
    }

    async getServerErrorsTable(
        criteria: GetValidationAndServerErrorOptionsDto,
    ): Promise<ServerErrorsTableResponseDto[]> {
        const qb = this.serverErrorsRepository
            .createQueryBuilder('se')
            .select([
                'se.msg AS "msg"',
                'se.type AS "type"',
                'se.traceback AS "traceback"',
                'se.errorCount AS "errorCount"',
            ])
            .orderBy('se.errorCount', 'DESC')
            .limit(criteria.limit);

        this.applyFilters<ServerError>(qb, criteria);
        applyPeriodFilter<ServerError>(
            qb,
            parsePeriod(criteria.period),
            'se',
            'timestamp',
        );

        return qb.getMany();
    }
}
