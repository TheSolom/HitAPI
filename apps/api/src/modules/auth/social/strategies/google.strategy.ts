import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Services } from '../../../../common/constants/services.constant.js';
import type { ISocialAuthService } from '../interfaces/social-auth-service.interface.js';
import type { EnvironmentVariablesDto } from '../../../../config/env/dto/environment-variables.dto.js';
import { SocialLoginDto } from '../dto/social-login.dto.js';
import { AuthProvidersEnum } from '../../enums/auth-providers.enum.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        @Inject(Services.SOCIAL_AUTH)
        private readonly socialAuthService: ISocialAuthService,
        private readonly configService: ConfigService<
            EnvironmentVariablesDto,
            true
        >,
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
        const emailObj = profile.emails?.[0];
        const email = emailObj?.value ?? '';
        const isVerified = Boolean(emailObj?.verified);

        const socialData: SocialLoginDto = {
            socialId: profile.id,
            displayName:
                profile.displayName || profile.name?.givenName || 'Google User',
            email,
            isVerified,
        };

        return this.socialAuthService.validateSocialLogin(
            AuthProvidersEnum.GOOGLE,
            socialData,
        );
    }
}
