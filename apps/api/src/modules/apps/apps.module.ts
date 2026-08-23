import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { App } from './entities/app.entity.js';
import { Framework } from './entities/framework.entity.js';
import { RequestLogsModule } from '../request-logs/request-logs.module.js';
import { AppsController } from './apps.controller.js';
import { FrameworksController } from './frameworks.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { AppsService } from './apps.service.js';
import { FrameworksService } from './frameworks.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([App, Framework]), RequestLogsModule],
    controllers: [AppsController, FrameworksController],
    providers: [
        {
            provide: Services.APPS,
            useClass: AppsService,
        },
        {
            provide: Services.FRAMEWORKS,
            useClass: FrameworksService,
        },
    ],
    exports: [Services.APPS, Services.FRAMEWORKS],
})
export class AppsModule {}
