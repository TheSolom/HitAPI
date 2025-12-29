import {
    Controller,
    Inject,
    UseGuards,
    Get,
    Put,
    Body,
    Param,
    Query,
    ParseUUIDPipe,
    NotFoundException,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOAuth2,
    ApiOkResponse,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiTooManyRequestsResponse,
    ApiParam,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IEndpointsService } from './interfaces/endpoints-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { EndpointResponseDto } from './dto/endpoint-response.dto.js';
import { EndpointConfigResponseDto } from './dto/endpoint-config-response.dto.js';
import { UpdateEndpointConfigDto } from './dto/update-endpoint-config.dto.js';
import { UpdateEndpointErrorConfigDto } from './dto/update-endpoint-error-config.dto.js';

@ApiTags('Endpoints')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@ApiParam({ name: 'appId' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.ENDPOINTS)
export class EndpointsController {
    constructor(
        @Inject(Services.ENDPOINTS)
        private readonly endpointsService: IEndpointsService,
    ) {}

    @Get()
    @ApiOkResponse({ type: createCustomResponse(EndpointResponseDto, true) })
    async listEndpoints(
        @Param('appId', ParseUUIDPipe) appId: string,
    ): Promise<EndpointResponseDto[]> {
        const endpoints = await this.endpointsService.findAllByApp(appId);

        return plainToInstance(EndpointResponseDto, endpoints);
    }

    @Get(':id')
    @ApiOkResponse({ type: createCustomResponse(EndpointResponseDto) })
    @ApiNotFoundResponse({ description: 'Endpoint not found' })
    @ApiParam({ name: 'id' })
    async getEndpoint(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<EndpointResponseDto> {
        const endpoint = await this.endpointsService.findOne(appId, id);
        if (!endpoint) throw new NotFoundException('Endpoint not found');

        return plainToInstance(EndpointResponseDto, endpoint);
    }

    @Get('config')
    @ApiOkResponse({ type: createCustomResponse(EndpointConfigResponseDto) })
    @ApiNotFoundResponse({ description: 'Endpoint not found' })
    @ApiQuery({ name: 'method' })
    @ApiQuery({ name: 'path' })
    async getEndpointConfig(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Query('method') method: string,
        @Query('path') path: string,
    ): Promise<EndpointConfigResponseDto> {
        return this.endpointsService.getConfig(appId, method, path);
    }

    @Put('config')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiNotFoundResponse({ description: 'Endpoint not found' })
    @ApiBody({ type: UpdateEndpointConfigDto })
    async updateEndpointConfig(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Body() updateEndpointConfigDto: UpdateEndpointConfigDto,
    ): Promise<void> {
        await this.endpointsService.updateConfig(
            appId,
            updateEndpointConfigDto,
        );
    }

    @Put('errors/config')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiNotFoundResponse({ description: 'Endpoint not found' })
    @ApiBody({ type: UpdateEndpointErrorConfigDto })
    async updateEndpointErrorConfig(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Body() updateEndpointErrorConfigDto: UpdateEndpointErrorConfigDto,
    ): Promise<void> {
        await this.endpointsService.updateErrorConfig(
            appId,
            updateEndpointErrorConfigDto,
        );
    }
}
