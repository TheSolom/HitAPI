import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from './entities/request-log.entity.js';
import { ApplicationLog } from './entities/application-log.entity.js';
import { RequestLogsController } from './request-logs.controller.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { RequestLogsRepository } from './repositories/request-logs.repository.js';
import { ApplicationLogsRepository } from './repositories/application-logs.repository.js';
import { Services } from '../../common/constants/services.constant.js';
import { RequestLogsService } from './request-logs.service.js';
import { ApplicationLogsService } from './application-logs.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([RequestLog, ApplicationLog])],
    controllers: [RequestLogsController],
    providers: [
        {
            provide: Repositories.REQUEST_LOGS,
            useClass: RequestLogsRepository,
        },
        {
            provide: Repositories.APPLICATION_LOGS,
            useClass: ApplicationLogsRepository,
        },
        {
            provide: Services.REQUEST_LOGS,
            useClass: RequestLogsService,
        },
        {
            provide: Services.APPLICATION_LOGS,
            useClass: ApplicationLogsService,
        },
    ],
    exports: [Services.REQUEST_LOGS, Services.APPLICATION_LOGS],
})
export class RequestLogsModule {}
