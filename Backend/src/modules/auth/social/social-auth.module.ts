import { Module } from '@nestjs/common';
import { TokensModule } from '../tokens/tokens.module.js';
import { UsersModule } from '../../users/users.module.js';
import { GoogleAuthController } from './google-auth.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import { SocialAuthService } from './social-auth.service.js';
import { GoogleStrategy } from './strategies/google.strategy.js';

@Module({
    imports: [TokensModule, UsersModule],
    controllers: [GoogleAuthController],
    providers: [
        {
            provide: Services.SOCIAL_AUTH,
            useClass: SocialAuthService,
        },
        GoogleStrategy,
    ],
    exports: [Services.SOCIAL_AUTH],
})
export class SocialAuthModule {}
