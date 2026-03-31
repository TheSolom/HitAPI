import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import type { EnvironmentVariablesDto } from '../../env/dto/environment-variables.dto.js';
import { Routes } from '../../../common/constants/routes.constant.js';

export const bullBoardConfiguration: DynamicModule =
    BullBoardModule.forRootAsync({
        useFactory: (
            configService: ConfigService<EnvironmentVariablesDto, true>,
        ) => ({
            route: `/${Routes.QUEUES}`,
            adapter: ExpressAdapter,
            middleware: (req: Request, res: Response, next: NextFunction) => {
                basicAuth({
                    users: {
                        [configService.getOrThrow<string>('BULL_BOARD_USER')]:
                            configService.getOrThrow<string>(
                                'BULL_BOARD_PASSWORD',
                            ),
                    },
                    challenge: true,
                    realm: 'HitAPI Queue Dashboard',
                })(req, res, next);
            },
        }),
        inject: [ConfigService],
    });
