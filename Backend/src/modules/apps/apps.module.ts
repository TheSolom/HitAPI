import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { App } from './entities/app.entity.js';
import { Framework } from './entities/framework.entity.js';
import { AppsController } from './apps.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { AppsService } from './apps.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([App, Framework])],
    controllers: [AppsController],
    providers: [
        {
            provide: Services.APPS,
            useClass: AppsService,
        },
    ],
})
export class AppsModule {}
