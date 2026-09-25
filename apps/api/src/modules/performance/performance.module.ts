import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLogsModule } from '../request-logs/request-logs.module.js';
import { TrafficMetric } from '../traffic/entities/traffic-metric.entity.js';
import { PerformanceController } from './performance.controller.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { PerformanceRepository } from './repositories/performance.repository.js';
import { Services } from '../../common/constants/services.constant.js';
import { PerformanceService } from './performance.service.js';

@Module({
    imports: [RequestLogsModule, TypeOrmModule.forFeature([TrafficMetric])],
    controllers: [PerformanceController],
    providers: [
        {
            provide: Repositories.PERFORMANCE,
            useClass: PerformanceRepository,
        },
        {
            provide: Services.PERFORMANCE,
            useClass: PerformanceService,
        },
    ],
})
export class PerformanceModule {}
