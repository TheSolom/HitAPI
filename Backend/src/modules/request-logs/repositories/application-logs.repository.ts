import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IApplicationLogsRepository } from '../interfaces/application-logs-repository.interface.js';
import type { LogCountByLevel } from '../interfaces/log-count-by-level.interface.js';
import { ApplicationLog } from '../entities/application-log.entity.js';

@Injectable()
export class ApplicationLogsRepository implements IApplicationLogsRepository {
    constructor(
        @InjectRepository(ApplicationLog)
        private readonly applicationLogRepository: Repository<ApplicationLog>,
    ) {}

    async findLogCountsByRequestUuids(
        requestUuids: string[],
    ): Promise<LogCountByLevel[]> {
        if (requestUuids.length === 0) return [];

        return this.applicationLogRepository
            .createQueryBuilder('al')
            .select('al.requestLog.requestUuid', 'requestUuid')
            .addSelect('al.level', 'level')
            .addSelect('COUNT(*)', 'count')
            .where('al.requestLog.requestUuid IN (:...uuids)', {
                uuids: requestUuids,
            })
            .groupBy('al.requestLog.requestUuid')
            .addGroupBy('al.level')
            .getRawMany<LogCountByLevel>();
    }

    async countByRequestUuid(requestUuid: string): Promise<number> {
        return this.applicationLogRepository.count({
            where: { requestLog: { requestUuid } },
        });
    }

    async findLogCountsByLevel(
        requestUuid: string,
    ): Promise<{ level: string; count: string }[]> {
        return this.applicationLogRepository
            .createQueryBuilder('al')
            .select('al.level', 'level')
            .addSelect('COUNT(*)', 'count')
            .where('al.requestLog.requestUuid = :requestUuid', { requestUuid })
            .groupBy('al.level')
            .getRawMany<{ level: string; count: string }>();
    }

    async findByRequestUuidAndAppId(
        requestUuid: string,
        appId: string,
    ): Promise<ApplicationLog[]> {
        return this.applicationLogRepository
            .createQueryBuilder('al')
            .innerJoin('al.requestLog', 'rl')
            .innerJoin('rl.app', 'a')
            .where('al.requestLog.requestUuid = :requestUuid', { requestUuid })
            .andWhere({ requestLog: { app: { id: appId } } })
            .orderBy('al.timestamp', 'ASC')
            .getMany();
    }
}
