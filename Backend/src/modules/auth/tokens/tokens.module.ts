import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { HashingModule } from '../../hashing/hashing.module.js';
import { Services } from '../../../common/constants/services.constant.js';
import { TokensService } from './tokens.service.js';
import { RefreshTokenCleanupService } from './refresh-token-cleanup.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([RefreshToken]), HashingModule],
    providers: [
        {
            provide: Services.TOKENS,
            useClass: TokensService,
        },
        RefreshTokenCleanupService,
    ],
    exports: [Services.TOKENS],
})
export class TokensModule {}
