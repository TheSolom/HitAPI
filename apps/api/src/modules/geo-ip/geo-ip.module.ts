import { Module } from '@nestjs/common';
import { GeoIPController } from './geo-ip.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { GeoIPService } from './geo-ip.service.js';

@Module({
    controllers: [GeoIPController],
    providers: [
        {
            provide: Services.GEO_IP,
            useClass: GeoIPService,
        },
    ],
    exports: [Services.GEO_IP],
})
export class GeoIPModule {}
