import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consumer } from './entities/consumer.entity.js';
import { ConsumerGroup } from './entities/consumer-group.entity.js';
import { ConsumersController } from './consumers.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { ConsumersService } from './consumers.service.js';
import { ConsumerGroupsService } from './consumer-groups.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Consumer, ConsumerGroup])],
    controllers: [ConsumersController],
    providers: [
        {
            provide: Services.CONSUMERS,
            useClass: ConsumersService,
        },
        {
            provide: Services.CONSUMER_GROUPS,
            useClass: ConsumerGroupsService,
        },
    ],
})
export class ConsumersModule {}
