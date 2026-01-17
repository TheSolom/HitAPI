import {
    Inject,
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTooManyRequestsResponse,
    ApiParam,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Routes } from '../../../common/constants/routes.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { ISessionsService } from './interfaces/sessions-service.interface.js';
import { createCustomResponse } from '../../../common/utils/create-custom-response.util.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { AuthUser } from '../../users/decorators/auth-user.decorator.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { UserSessionDto } from './dto/user-session.dto.js';

@ApiTags('Auth Sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@Controller(Routes.AUTH)
export class SessionsController {
    constructor(
        @Inject(Services.SESSIONS)
        private readonly sessionsService: ISessionsService,
    ) {}

    @Get('sessions')
    @ApiOkResponse({ type: createCustomResponse(UserSessionDto, true) })
    async getActiveSessions(
        @AuthUser() { id: userId }: AuthenticatedUser,
    ): Promise<UserSessionDto[]> {
        const tokens = await this.sessionsService.getUserActiveSessions(userId);

        return plainToInstance(UserSessionDto, tokens);
    }

    @Post('sessions/:sessionId/revoke')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiParam({ name: 'sessionId' })
    async revokeSession(
        @Param('sessionId', ParseUUIDPipe) sessionId: string,
    ): Promise<void> {
        await this.sessionsService.revokeSession(sessionId);
    }
}
