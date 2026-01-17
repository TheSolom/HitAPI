import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Services } from '../../../common/constants/services.constant.js';
import type { ITokensService } from './interfaces/tokens-service.interface.js';

@Injectable()
export class RefreshTokenCleanupService {
    constructor(
        @Inject(Services.TOKENS) private readonly tokensService: ITokensService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanup() {
        await this.tokensService.removeExpiredRefreshTokens();
    }
}
