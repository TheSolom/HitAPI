import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IServerErrorsRepository } from '../interfaces/server-errors-repository.interface.js';
import { ServerError } from '../entities/server-error.entity.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { ServerErrorsTableResponseDto } from '../dto/server-errors-table-response.dto.js';
import { applyErrorsTableFilters } from '../utils/errors-query.util.js';

@Injectable()
export class ServerErrorsRepository implements IServerErrorsRepository {
    constructor(
        @InjectRepository(ServerError)
        private readonly serverErrorsRepository: Repository<ServerError>,
    ) {}

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

        applyErrorsTableFilters(qb, criteria, 'se');

        return qb.getRawMany<ServerErrorsTableResponseDto>();
    }
}
