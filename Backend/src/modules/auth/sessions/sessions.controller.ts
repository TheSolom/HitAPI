import {
    Inject,
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Get,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Routes } from '../../../common/constants/routes.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { ISessionsService } from './interfaces/sessions-service.interface.js';
import { CustomResponse } from '../../../common/dto/custom-response.dto.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { AuthUser } from '../../users/decorators/auth-user.decorator.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { UserSessionDto } from './dto/user-session.dto.js';

@ApiTags('Auth Sessions')
@Controller(Routes.AUTH)
export class SessionsController {
    constructor(
        @Inject(Services.SESSIONS)
        private readonly sessionsService: ISessionsService,
    ) {}

    @Get('sessions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOkResponse({ type: CustomResponse<UserSessionDto>, isArray: true })
    async getActiveSessions(
        @AuthUser() authUser: AuthenticatedUser,
    ): Promise<UserSessionDto[]> {
        const tokens = await this.sessionsService.getUserActiveSessions(
            authUser.id,
        );

        return tokens.map((token) => plainToInstance(UserSessionDto, token));
    }

    @Post('sessions/:sessionId/revoke')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT')
    @ApiNoContentResponse()
    async revokeSession(@Body() body: { sessionId: string }): Promise<void> {
        await this.sessionsService.revokeSession(body.sessionId);
    }
}
