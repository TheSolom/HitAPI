import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import type { IValidationErrorsRepository } from '../interfaces/validation-errors-repository.interface.js';
import { ValidationError } from '../entities/validation-error.entity.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { ValidationErrorsTableResponseDto } from '../dto/validation-errors-table-response.dto.js';

@Injectable()
export class ValidationErrorsRepository implements IValidationErrorsRepository {
    constructor(
        @InjectRepository(ValidationError)
        private readonly validationErrorsRepository: Repository<ValidationError>,
    ) {}

    private applyFilters(
        qb: SelectQueryBuilder<ValidationError>,
        criteria: GetValidationAndServerErrorOptionsDto,
    ): void {
        if (criteria.consumerId || criteria.consumerGroupId) {
            qb.innerJoin('ve.consumer', 'consumer');

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

        this.applyFilters(qb, criteria);

        return qb.getRawMany<ValidationErrorsTableResponseDto>();
    }
}
