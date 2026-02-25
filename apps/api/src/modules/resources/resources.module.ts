import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { ResourcesRepository } from './repositories/resources.repository.js';
import { ResourcesController } from './resources.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { ResourcesService } from './resources.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Resource])],
    controllers: [ResourcesController],
    providers: [
        {
            provide: Repositories.RESOURCES,
            useClass: ResourcesRepository,
        },
        {
            provide: Services.RESOURCES,
            useClass: ResourcesService,
        },
    ],
    exports: [Services.RESOURCES],
})
export class ResourcesModule {}
