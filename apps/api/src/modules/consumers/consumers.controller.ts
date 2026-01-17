import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Inject,
    UseGuards,
    NotFoundException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOAuth2,
    ApiUnauthorizedResponse,
    ApiTooManyRequestsResponse,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiNoContentResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IConsumersService } from './interfaces/consumers-service.interface.js';
import type { IConsumerGroupsService } from './interfaces/consumer-groups-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { ConsumerResponseDto } from './dto/consumer-response.dto.js';
import { ConsumerGroupResponseDto } from './dto/consumer-group-response.dto.js';
import { UpdateConsumerDto } from './dto/update-consumer.dto.js';
import { CreateConsumerGroupDto } from './dto/create-consumer-group.dto.js';
import { UpdateConsumerGroupDto } from './dto/update-consumer-group.dto.js';

@ApiTags('Consumers')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@ApiParam({ name: 'appId', format: 'uuid' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.CONSUMERS)
export class ConsumersController {
    constructor(
        @Inject(Services.CONSUMERS)
        private readonly consumersService: IConsumersService,
        @Inject(Services.CONSUMER_GROUPS)
        private readonly consumerGroupsService: IConsumerGroupsService,
    ) {}

    @Get('consumers')
    @ApiOkResponse({ type: createCustomResponse(ConsumerResponseDto, true) })
    async listConsumers(
        @Param('appId', ParseUUIDPipe) appId: string,
    ): Promise<ConsumerResponseDto[]> {
        const consumers = await this.consumersService.findAllByAppId(appId);

        return plainToInstance(ConsumerResponseDto, consumers);
    }

    @Get('consumers/:consumerId')
    @ApiOkResponse({ type: createCustomResponse(ConsumerResponseDto) })
    @ApiNotFoundResponse({ description: 'Consumer not found' })
    @ApiParam({ name: 'consumerId' })
    async getConsumer(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Param('consumerId', ParseIntPipe) consumerId: number,
    ): Promise<ConsumerResponseDto> {
        const consumer = await this.consumersService.findById(
            appId,
            consumerId,
        );

        if (!consumer) {
            throw new NotFoundException(`Consumer not found`);
        }

        return plainToInstance(ConsumerResponseDto, consumer);
    }

    @Put('consumers/:consumerId')
    @ApiOkResponse({ type: createCustomResponse(null) })
    @ApiNotFoundResponse({ description: 'Consumer not found' })
    @ApiBody({ type: UpdateConsumerDto })
    @ApiParam({ name: 'consumerId' })
    async updateConsumer(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Param('consumerId', ParseIntPipe) consumerId: number,
        @Body() updateConsumerDto: UpdateConsumerDto,
    ): Promise<void> {
        return this.consumersService.updateConsumer(
            appId,
            consumerId,
            updateConsumerDto,
        );
    }

    @Get('consumer-groups')
    @ApiOkResponse({
        type: createCustomResponse(ConsumerGroupResponseDto, true),
    })
    async listConsumerGroups(
        @Param('appId', ParseUUIDPipe) appId: string,
    ): Promise<ConsumerGroupResponseDto[]> {
        const groups =
            await this.consumerGroupsService.findAllConsumerGroups(appId);
        return plainToInstance(ConsumerGroupResponseDto, groups);
    }

    @Get('consumer-groups/:groupId')
    @ApiOkResponse({ type: createCustomResponse(ConsumerGroupResponseDto) })
    @ApiNotFoundResponse({ description: 'Consumer group not found' })
    @ApiParam({ name: 'groupId' })
    async getConsumerGroup(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Param('groupId', ParseIntPipe) groupId: number,
    ): Promise<ConsumerGroupResponseDto> {
        const group = await this.consumerGroupsService.findConsumerGroup(
            appId,
            groupId,
        );

        if (!group) {
            throw new NotFoundException(`Consumer group not found`);
        }

        return plainToInstance(ConsumerGroupResponseDto, group);
    }

    @Post('consumer-groups')
    @ApiCreatedResponse({ type: ConsumerGroupResponseDto })
    @ApiBody({ type: CreateConsumerGroupDto })
    async createConsumerGroup(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Body() createConsumerGroupDto: CreateConsumerGroupDto,
    ): Promise<ConsumerGroupResponseDto> {
        const group = await this.consumerGroupsService.createConsumerGroup(
            appId,
            createConsumerGroupDto,
        );

        return plainToInstance(ConsumerGroupResponseDto, group);
    }

    @Put('consumer-groups/:groupId')
    @ApiOkResponse({ type: createCustomResponse(null) })
    @ApiNotFoundResponse({ description: 'Consumer group not found' })
    @ApiBody({ type: UpdateConsumerGroupDto })
    @ApiParam({ name: 'groupId' })
    async updateConsumerGroup(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Param('groupId', ParseIntPipe) groupId: number,
        @Body() updateConsumerGroupDto: UpdateConsumerGroupDto,
    ): Promise<void> {
        return this.consumerGroupsService.updateConsumerGroup(
            appId,
            groupId,
            updateConsumerGroupDto,
        );
    }

    @Delete('consumer-groups/:groupId')
    @ApiNoContentResponse()
    @ApiParam({ name: 'groupId' })
    async deleteConsumerGroup(
        @Param('appId', ParseUUIDPipe) appId: string,
        @Param('groupId', ParseIntPipe) groupId: number,
    ): Promise<void> {
        return this.consumerGroupsService.deleteConsumerGroup(appId, groupId);
    }
}
