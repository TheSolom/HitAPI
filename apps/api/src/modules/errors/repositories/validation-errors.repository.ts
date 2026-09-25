import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IValidationErrorsRepository } from '../interfaces/validation-errors-repository.interface.js';
import { ValidationError } from '../entities/validation-error.entity.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { ValidationErrorsTableResponseDto } from '../dto/validation-errors-table-response.dto.js';
import { applyErrorsTableFilters } from '../utils/errors-query.util.js';

@Injectable()
export class ValidationErrorsRepository implements IValidationErrorsRepository {
    constructor(
        @InjectRepository(ValidationError)
        private readonly validationErrorsRepository: Repository<ValidationError>,
    ) {}

    async getValidationErrorsTable(
        criteria: GetValidationAndServerErrorOptionsDto,
    ): Promise<ValidationErrorsTableResponseDto[]> {
        const qb = this.validationErrorsRepository
            .createQueryBuilder('ve')
            .innerJoin('ve.endpoint', 'endpoint')
            .innerJoin('endpoint.app', 'app')
            .where('app.id = :appId', { appId: criteria.appId })
            .select([
                've.msg AS "msg"',
                've.type AS "type"',
                've.loc AS "loc"',
                've.errorCount AS "errorCount"',
            ])
            .orderBy('ve.errorCount', 'DESC')
            .limit(criteria.limit);

        applyErrorsTableFilters(qb, criteria, 've');

        return qb.getRawMany<ValidationErrorsTableResponseDto>();
    }
}
