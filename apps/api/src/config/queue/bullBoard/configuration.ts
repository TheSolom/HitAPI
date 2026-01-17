import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { DynamicModule } from '@nestjs/common';
import { Routes } from '../../../common/constants/routes.constant.js';

export const bullBoardConfiguration: DynamicModule =
    BullBoardModule.forRootAsync({
        useFactory: () => ({
            route: Routes.QUEUES,
            adapter: ExpressAdapter,
        }),
    });
