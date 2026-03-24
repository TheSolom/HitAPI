import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficMetric } from './entities/traffic-metric.entity.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { TrafficMetricsRepository } from './repositories/traffic-metrics.repository.js';

@Module({
    imports: [TypeOrmModule.forFeature([TrafficMetric])],
    providers: [
        {
            provide: Repositories.TRAFFIC_METRICS,
            useClass: TrafficMetricsRepository,
        },
    ],
    exports: [Repositories.TRAFFIC_METRICS],
})
export class TrafficModule {}
