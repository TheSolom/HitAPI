import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficMetric } from './entities/traffic-metric.entity.js';
import { RequestLogsModule } from '../request-logs/request-logs.module.js';
import { ErrorsModule } from '../errors/errors.module.js';
import { TrafficController } from './traffic.controller.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { TrafficRepository } from './repositories/traffic.repository.js';
import { TrafficMetricsRepository } from './repositories/traffic-metrics.repository.js';
import { Services } from '../../common/constants/services.constant.js';
import { TrafficService } from './traffic.service.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([TrafficMetric]),
        RequestLogsModule,
        forwardRef(() => ErrorsModule),
    ],
    controllers: [TrafficController],
    providers: [
        {
            provide: Repositories.TRAFFIC,
            useClass: TrafficRepository,
        },
        {
            provide: Repositories.TRAFFIC_METRICS,
            useClass: TrafficMetricsRepository,
        },
        {
            provide: Services.TRAFFIC,
            useClass: TrafficService,
        },
    ],
    exports: [Repositories.TRAFFIC_METRICS, Services.TRAFFIC],
})
export class TrafficModule {}
