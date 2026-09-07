import { Module, Global } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service.js';
import { RateLimitGuard } from './guards/rate-limit.guard.js';
import { Services } from '../../common/constants/services.constant.js';

@Global()
@Module({
    providers: [
        {
            provide: Services.RATE_LIMIT,
            useClass: RateLimitService,
        },
        RateLimitService,
        RateLimitGuard,
    ],
    exports: [Services.RATE_LIMIT, RateLimitService, RateLimitGuard],
})
export class RateLimitModule {}
