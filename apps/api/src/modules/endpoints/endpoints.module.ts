import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endpoint } from './entities/endpoint.entity.js';
import { EndpointsController } from './endpoints.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { EndpointsService } from './endpoints.service.js';
import { EndpointConfigsService } from './endpoint-configs.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Endpoint])],
    controllers: [EndpointsController],
    providers: [
        {
            provide: Services.ENDPOINTS,
            useClass: EndpointsService,
        },
        {
            provide: Services.ENDPOINT_CONFIGS,
            useClass: EndpointConfigsService,
        },
    ],
    exports: [Services.ENDPOINTS, Services.ENDPOINT_CONFIGS],
})
export class EndpointsModule {}
