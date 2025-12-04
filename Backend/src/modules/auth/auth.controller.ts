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
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiBody,
    ApiHeaders,
} from '@nestjs/swagger';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IAuthService } from './interfaces/auth-service.interface.js';
import type { ITokensService } from './tokens/interfaces/tokens-service.interface.js';
import type { ISessionsService } from './sessions/interfaces/sessions-service.interface.js';
import type { ISocialAuthService } from './social/interfaces/social-auth-service.interface.js';
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

@ApiTags('Auth')
@Controller(Routes.AUTH)
export class AuthController {
    constructor(
        @Inject(Services.AUTH) private readonly authService: IAuthService,
        @Inject(Services.TOKENS)
        private readonly tokensService: ITokensService,
        @Inject(Services.SESSIONS)
        private readonly sessionsService: ISessionsService,
        @Inject(Services.SOCIAL_AUTH)
        private readonly socialAuthService: ISocialAuthService,
    ) {}

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
        @Headers('user-agent') userAgent: string,
        @Ip() ip: string,
    ): Promise<LoginTokensDto> {
        return this.tokensService.generateTokenPair(authUser, userAgent, ip);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RefreshTokenGuard)
    @SkipResponseInterceptor()
    @Header('Cache-Control', 'no-store')
    @ApiBearerAuth('JWT')
    @ApiCreatedResponse({ type: LoginTokensDto })
    @ApiUnauthorizedResponse({ description: 'Invalid token' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiHeaders([
        { name: 'user-agent', required: false },
        { name: 'ip', required: false },
    ])
    refreshToken(
        @AuthUser() authUser: AuthenticatedUser,
        @Headers('user-agent') userAgent: string,
        @Ip() ip: string,
    ): Promise<LoginTokensDto> {
        return this.tokensService.generateTokenPair(authUser, userAgent, ip);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RefreshTokenGuard)
    @ApiBearerAuth('JWT')
    @ApiNoContentResponse()
    @ApiUnauthorizedResponse({ description: 'Invalid token' })
    async logout(
        @Body() { refreshToken }: LogoutDto,
        @AuthUser() authUser: AuthenticatedUser,
    ) {
        await this.tokensService.revokeRefreshToken(refreshToken, authUser.id);
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
