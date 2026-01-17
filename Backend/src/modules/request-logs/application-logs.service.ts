import { Injectable, Inject } from '@nestjs/common';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type { ApplicationLog } from './entities/application-log.entity.js';
import type { IApplicationLogsRepository } from './interfaces/application-logs-repository.interface.js';
import type { IApplicationLogsService } from './interfaces/application-logs-service.interface.js';
import type { CreateApplicationLogDto } from './dto/create-application-log.dto.js';

@Injectable()
export class ApplicationLogsService implements IApplicationLogsService {
    constructor(
        @Inject(Repositories.APPLICATION_LOGS)
        private readonly applicationLogsRepository: IApplicationLogsRepository,
    ) {}

    async createApplicationLogs(
        applicationLogDto: CreateApplicationLogDto[],
    ): Promise<void> {
        return this.applicationLogsRepository.createApplicationLogs(
            applicationLogDto,
        );
    }

    async getApplicationLogs(
        requestUuid: string,
        appId: string,
    ): Promise<ApplicationLog[]> {
        return this.applicationLogsRepository.findByRequestUuidAndAppId(
            requestUuid,
            appId,
        );
    }
}
