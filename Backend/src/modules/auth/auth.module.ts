import { Module } from '@nestjs/common';
import { JwtModule } from '../../config/jwt/jwt.module.js';
import { PassportModule } from '@nestjs/passport';
import { HashingModule } from '../hashing/hashing.module.js';
import { MailsModule } from '../mails/mails.module.js';
import { VerificationModule } from './verification/verification.module.js';
import { PasswordsModule } from './passwords/passwords.module.js';
import { TokensModule } from './tokens/tokens.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { UsersModule } from '../users/users.module.js';
import { SocialAuthModule } from './social/social-auth.module.js';
import { RegistrationModule } from './registration/registration.module.js';
import { AuthController } from './auth.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { AnonymousStrategy } from './strategies/anonymous.strategy.js';

@Module({
    imports: [
        JwtModule,
        PassportModule,
        HashingModule,
        MailsModule,
        VerificationModule,
        PasswordsModule,
        TokensModule,
        SessionsModule,
        UsersModule,
        SocialAuthModule,
        RegistrationModule,
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
        JwtStrategy,
        LocalStrategy,
        AnonymousStrategy,
    ],
    exports: [Services.AUTH],
})
export class AuthModule {}
