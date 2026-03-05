import {
    Controller,
    Inject,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiHeader,
    ApiBody,
    ApiQuery,
    ApiConsumes,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
    ApiAcceptedResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import type { UserApp as UserAppType } from '@hitapi/types';
import { Routes } from '../../common/constants/routes.constant.js';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IIngestionService } from './interfaces/ingestion-service.interface.js';
import type { IRateLimitService } from '../rate-limit/interfaces/rate-limit-service.interface.js';
import { RequestLogItemDto } from './dto/request-log-item.dto.js';
import { UserApp } from './decorators/user-app.decorator.js';
import { RateLimitType } from '../rate-limit/enums/rate-limit.enum.js';

@ApiTags('Ingestion')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@ApiHeader({ name: 'X-Client-ID' })
@UseGuards(ClientAuthGuard)
@Controller(Routes.INGESTION)
export class IngestionController {
    constructor(
        @Inject(Services.INGESTION)
        private readonly ingestionService: IIngestionService,
        @Inject(Services.RATE_LIMIT)
        private readonly rateLimitService: IRateLimitService,
    ) {}

    @Post('logs')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiConsumes('application/x-ndjson')
    @ApiAcceptedResponse({ description: 'Accepted for processing' })
    @ApiBadRequestResponse({ description: 'Invalid gzip data or NDJSON' })
    @ApiBody({ type: RequestLogItemDto, isArray: true })
    @ApiQuery({ name: 'fileUuid', format: 'uuid' })
    async ingestRequestLog(
        @Query('fileUuid', ParseUUIDPipe) fileUuid: string,
        @Body() requestLogItems: RequestLogItemDto[],
        @UserApp() app: UserAppType,
    ) {
        await this.rateLimitService.checkRateLimit(
            app.id,
            RateLimitType.API_CALL,
        );

        await this.ingestionService.ingestRequestLogs(
            app,
            fileUuid,
            requestLogItems,
        );

        return {
            fileUuid,
            received: requestLogItems.length,
        };
    }
}
