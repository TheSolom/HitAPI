import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Services } from '../../../../common/constants/services.constant.js';
import type { ISocialAuthService } from '../interfaces/social-auth-service.interface.js';
import type { Environment } from '../../../../common/interfaces/env.interface.js';
import { SocialLoginDto } from '../dto/social-login.dto.js';
import { AuthProvidersEnum } from '../../enums/auth-providers.enum.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        @Inject(Services.SOCIAL_AUTH)
        private readonly socialAuthService: ISocialAuthService,
        private readonly configService: ConfigService<Environment, true>,
    ) {
        super({
            clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>(
                'GOOGLE_CLIENT_SECRET',
            ),
            callbackURL: configService.getOrThrow<string>(
                'GOOGLE_REDIRECT_URI',
            ),
            scope: ['profile', 'email'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ) {
        const socialData: SocialLoginDto = {
            socialId: profile.id,
            displayName: profile.displayName,
            email: profile.emails![0].value,
            isVerified: profile.emails![0].verified,
        };

        return this.socialAuthService.validateSocialLogin(
            AuthProvidersEnum.GOOGLE,
            socialData,
        );
    }
}
