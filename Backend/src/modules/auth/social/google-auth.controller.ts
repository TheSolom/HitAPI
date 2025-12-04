import {
    Controller,
    Get,
    Post,
    Body,
    Headers,
    Ip,
    Inject,
    UseGuards,
    Header,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { ApiHeaders, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Routes } from '../../../common/constants/routes.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { ITokensService } from '../tokens/interfaces/tokens-service.interface.js';
import type { ISocialAuthService } from './interfaces/social-auth-service.interface.js';
import type { Environment } from 'src/common/interfaces/env.interface.js';
import { GoogleOAuth2Guard } from './guards/google-OAuth2.guard.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { TokenExchangeDto } from './dto/token-exchange.dto.js';
import { LoginTokensDto } from '../tokens/dto/login-tokens.dto.js';
import { AuthUser } from '../../users/decorators/auth-user.decorator.js';
import { SocialLoginDto } from './dto/social-login.dto.js';
import { AuthProvidersEnum } from '../enums/auth-providers.enum.js';
import { SkipResponseInterceptor } from '../../../common/decorators/skip-response-interceptor.decorator.js';

@ApiTags('Auth Google')
@Controller(Routes.AUTH_GOOGLE)
export class GoogleAuthController {
    private readonly oauth2Client: OAuth2Client;

    constructor(
        @Inject(Services.TOKENS) private readonly tokensService: ITokensService,
        @Inject(Services.SOCIAL_AUTH)
        private readonly socialAuthService: ISocialAuthService,
        private readonly configService: ConfigService<Environment, true>,
    ) {
        this.oauth2Client = new OAuth2Client(
            this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            this.configService.getOrThrow<string>('OAUTH2_REDIRECT_URL'),
        );
    }

    @Get('login')
    @UseGuards(GoogleOAuth2Guard)
    googleLogin() {
        // Google OAuth2 redirect handled by Guard
    }

    @Get('redirect')
    @UseGuards(GoogleOAuth2Guard)
    @SkipResponseInterceptor()
    @Header('Cache-Control', 'no-store')
    @ApiOkResponse({ type: LoginTokensDto })
    @ApiHeaders([
        { name: 'user-agent', required: false },
        { name: 'ip', required: false },
    ])
    async googleLoginRedirect(
        @AuthUser() authUser: AuthenticatedUser,
        @Headers('user-agent') userAgent?: string,
        @Ip() ip?: string,
    ): Promise<LoginTokensDto> {
        return this.tokensService.generateTokenPair(authUser, userAgent, ip);
    }

    @Post('token')
    @HttpCode(HttpStatus.OK)
    @SkipResponseInterceptor()
    @Header('Cache-Control', 'no-store')
    @ApiOkResponse({ type: LoginTokensDto })
    @ApiHeaders([
        { name: 'user-agent', required: false },
        { name: 'ip', required: false },
    ])
    async tokenExchange(
        @Body() tokenExchangeDto: TokenExchangeDto,
        @Headers('user-agent') userAgent?: string,
        @Ip() ip?: string,
    ): Promise<LoginTokensDto> {
        try {
            if (tokenExchangeDto.client_id !== this.oauth2Client._clientId) {
                throw new BadRequestException('Invalid client ID');
            }

            if (
                tokenExchangeDto.client_secret !==
                this.oauth2Client._clientSecret
            ) {
                throw new BadRequestException('Invalid client secret');
            }

            const { tokens } = await this.oauth2Client.getToken(
                tokenExchangeDto.code,
            );

            if (!tokens.id_token) {
                throw new BadRequestException(
                    'No ID token received from Google',
                );
            }

            const ticket = await this.oauth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience:
                    this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();

            if (!payload) {
                throw new BadRequestException('Invalid token payload');
            }

            const socialData = this.extractProfileData(payload);

            const authUser = await this.socialAuthService.validateSocialLogin(
                AuthProvidersEnum.GOOGLE,
                socialData,
            );

            return this.tokensService.generateTokenPair(
                authUser,
                userAgent,
                ip,
            );
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(
                `Google token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    private extractProfileData(payload: TokenPayload): SocialLoginDto {
        return {
            socialId: payload.sub,
            displayName: payload.name ?? '',
            email: payload.email ?? '',
            isVerified: payload.email_verified ?? false,
        };
    }
}
