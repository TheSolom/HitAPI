import { Module, Global } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service.js';
import { Services } from '../../common/constants/services.constant.js';

@Global()
@Module({
    providers: [
        {
            provide: Services.RATE_LIMIT,
            useClass: RateLimitService,
        },
    ],
    exports: [Services.RATE_LIMIT],
})
export class RateLimitModule {}
