import {
    Controller,
    Inject,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiHeader,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
    ApiAcceptedResponse,
    ApiBody,
} from '@nestjs/swagger';
import { Routes } from '../../common/constants/routes.constant.js';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IIngestionService } from './interfaces/ingestion-service.interface.js';
import { UserApp } from './decorators/user-app.decorator.js';
import type { IRateLimitService } from '../rate-limit/interfaces/rate-limit-service.interface.js';
import { RateLimitType } from '../rate-limit/enums/rate-limit.enum.js';
import type { App } from '../apps/entities/app.entity.js';
import { IngestRequestLogsDto } from './dto/ingest-request-logs.dto.js';
import { IngestApplicationLogsDto } from './dto/ingest-application-logs.dto.js';

@ApiTags('Ingestion')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@ApiAcceptedResponse({ description: 'Accepted for processing' })
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

    @Post('requests')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiBody({ type: IngestRequestLogsDto })
    async ingestRequests(
        @Body() requestLogs: IngestRequestLogsDto,
        @UserApp() app: App,
    ) {
        await this.rateLimitService.checkRateLimit(
            app.id,
            RateLimitType.API_CALL,
        );

        await this.ingestionService.ingestRequestLogs(requestLogs, app);

        return {
            queued: requestLogs.requests.length,
            batchId: `batch_${Date.now()}`,
        };
    }

    @Post('logs')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiBody({ type: IngestApplicationLogsDto })
    async ingestLogs(
        @Body() logs: IngestApplicationLogsDto,
        @UserApp() app: App,
    ) {
        await this.ingestionService.ingestApplicationLogs(logs, app);

        return {
            queued: logs.logs.length,
            batchId: `batch_${Date.now()}`,
        };
    }
}
