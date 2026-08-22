import {
    Inject,
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Headers,
    Ip,
    Delete,
    Param,
    Header,
    Res,
    Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {
    ApiTags,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiTooManyRequestsResponse,
    ApiBody,
    ApiHeaders,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IAuthService } from './interfaces/auth-service.interface.js';
import type { ITokensService } from './tokens/interfaces/tokens-service.interface.js';
import type { ISessionsService } from './sessions/interfaces/sessions-service.interface.js';
import type { ISocialAuthService } from './social/interfaces/social-auth-service.interface.js';
import type { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';
import { AuthenticatedUser } from '../users/dto/auth-user.dto.js';
import { EmailLoginDto } from './dto/email-login.dto.js';
import { LoginTokensDto } from './tokens/dto/login-tokens.dto.js';
import { AuthUser } from '../users/decorators/auth-user.decorator.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { SkipResponseInterceptor } from '../../common/decorators/skip-response-interceptor.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from './tokens/guards/refresh-token.guard.js';
import { RefreshTokenDto } from './tokens/dto/refresh-token.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { AuthProvidersEnum } from './enums/auth-providers.enum.js';
import {
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
    REFRESH_TOKEN_COOKIE,
} from './utils/auth-cookie.util.js';

@ApiTags('Auth')
@Controller(Routes.AUTH)
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
export class AuthController {
    constructor(
        @Inject(Services.AUTH) private readonly authService: IAuthService,
        @Inject(Services.TOKENS)
        private readonly tokensService: ITokensService,
        @Inject(Services.SESSIONS)
        private readonly sessionsService: ISessionsService,
        @Inject(Services.SOCIAL_AUTH)
        private readonly socialAuthService: ISocialAuthService,
        private readonly configService: ConfigService<
            EnvironmentVariablesDto,
            true
        >,
    ) {}

    private async issueTokens(
        authUser: AuthenticatedUser,
        res: Response,
        userAgent?: string,
        ip?: string,
    ): Promise<LoginTokensDto> {
        const tokens = await this.tokensService.generateTokenPair(
            authUser,
            userAgent,
            ip,
        );

        setRefreshTokenCookie(res, tokens.refresh_token, this.configService);

        return tokens;
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @SkipResponseInterceptor()
    @Header('Cache-Control', 'no-store')
    @ApiOkResponse({ type: LoginTokensDto })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiBody({ type: EmailLoginDto })
    @ApiHeaders([
        { name: 'user-agent', required: false },
        { name: 'ip', required: false },
    ])
    async login(
        @AuthUser() authUser: AuthenticatedUser,
        @Res({ passthrough: true }) res: Response,
        @Headers('user-agent') userAgent?: string,
        @Ip() ip?: string,
    ): Promise<LoginTokensDto> {
        return this.issueTokens(authUser, res, userAgent, ip);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    @SkipResponseInterceptor()
    @Header('Cache-Control', 'no-store')
    @ApiCreatedResponse({ type: LoginTokensDto })
    @ApiUnauthorizedResponse({ description: 'Invalid token' })
    @ApiBody({ type: RefreshTokenDto, required: false })
    @ApiHeaders([
        { name: 'user-agent', required: false },
        { name: 'ip', required: false },
    ])
    async refreshToken(
        @AuthUser() authUser: AuthenticatedUser,
        @Res({ passthrough: true }) res: Response,
        @Headers('user-agent') userAgent?: string,
        @Ip() ip?: string,
    ): Promise<LoginTokensDto> {
        return this.issueTokens(authUser, res, userAgent, ip);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @SkipResponseInterceptor()
    @ApiNoContentResponse()
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() body?: LogoutDto,
    ): Promise<void> {
        const cookies = req.cookies as Record<string, string> | undefined;
        const refreshToken =
            cookies?.[REFRESH_TOKEN_COOKIE] || body?.refreshToken;

        if (refreshToken) {
            await this.tokensService.revokeRefreshToken(refreshToken);
        }

        clearRefreshTokenCookie(res);
    }

    @Post('logout-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT')
    @ApiNoContentResponse()
    @ApiUnauthorizedResponse({ description: 'Invalid token' })
    async logoutAll(@AuthUser() authUser: AuthenticatedUser): Promise<void> {
        await this.sessionsService.revokeAllUserSessions(authUser.id);
    }

    @Delete('social-accounts/:provider')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT')
    @ApiNoContentResponse()
    @ApiUnauthorizedResponse({ description: 'Invalid token' })
    async unlinkSocialAccount(
        @AuthUser() authUser: AuthenticatedUser,
        @Param('provider') provider: AuthProvidersEnum,
    ): Promise<void> {
        await this.socialAuthService.unlinkSocialAccount(authUser.id, provider);
    }
}
