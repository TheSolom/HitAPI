import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';

export function applyErrorsTableFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    criteria: GetValidationAndServerErrorOptionsDto,
    alias: string,
): void {
    if (criteria.consumerId || criteria.consumerGroupId) {
        qb.innerJoin(`${alias}.consumer`, 'consumer');

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
