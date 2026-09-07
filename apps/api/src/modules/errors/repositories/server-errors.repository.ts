import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import type { IServerErrorsRepository } from '../interfaces/server-errors-repository.interface.js';
import { ServerError } from '../entities/server-error.entity.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { ServerErrorsTableResponseDto } from '../dto/server-errors-table-response.dto.js';

@Injectable()
export class ServerErrorsRepository implements IServerErrorsRepository {
    constructor(
        @InjectRepository(ServerError)
        private readonly serverErrorsRepository: Repository<ServerError>,
    ) {}

    private applyFilters(
        qb: SelectQueryBuilder<ServerError>,
        criteria: GetValidationAndServerErrorOptionsDto,
    ): void {
        if (criteria.consumerId || criteria.consumerGroupId) {
            qb.innerJoin('se.consumer', 'consumer');

            if (criteria.consumerId) {
                qb.andWhere('consumer.id = :consumerId', {
                    consumerId: criteria.consumerId,
                });
            }
            if (criteria.consumerGroupId) {
                qb.andWhere('consumer.groupId = :consumerGroupId', {
                    consumerGroupId: criteria.consumerGroupId,
                });
            }
        }
        if (criteria.method) {
            qb.andWhere('endpoint.method = :method', {
                method: criteria.method,
            });
        }
        if (criteria.path) {
            if (criteria.pathExact) {
                qb.andWhere('endpoint.path = :path', { path: criteria.path });
            } else {
                qb.andWhere('endpoint.path LIKE :path', {
                    path: `%${criteria.path}%`,
                });
            }
        }
    }

    async getServerErrorsTable(
        criteria: GetValidationAndServerErrorOptionsDto,
    ): Promise<ServerErrorsTableResponseDto[]> {
        const qb = this.serverErrorsRepository
            .createQueryBuilder('se')
            .innerJoin('se.endpoint', 'endpoint')
            .innerJoin('endpoint.app', 'app')
            .where('app.id = :appId', { appId: criteria.appId })
            .select([
                'se.msg AS "msg"',
                'se.type AS "type"',
                'se.traceback AS "traceback"',
                'se.errorCount AS "errorCount"',
            ])
            .orderBy('se.errorCount', 'DESC')
            .limit(criteria.limit);

        this.applyFilters(qb, criteria);

        return qb.getRawMany<ServerErrorsTableResponseDto>();
    }
}
