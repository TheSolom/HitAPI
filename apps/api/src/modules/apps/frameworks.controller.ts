import {
    Controller,
    Inject,
    UseGuards,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    NotFoundException,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOAuth2,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiTooManyRequestsResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IFrameworksService } from './interfaces/frameworks-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { FrameworkResponseDto } from './dto/framework-response.dto.js';
import { CreateFrameworkDto } from './dto/create-framework.dto.js';
import { UpdateFrameworkDto } from './dto/update-framework.dto.js';

@ApiTags('Frameworks')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.FRAMEWORKS)
export class FrameworksController {
    constructor(
        @Inject(Services.FRAMEWORKS)
        private readonly frameworksService: IFrameworksService,
    ) {}

    @Get()
    @ApiOkResponse({ type: createCustomResponse(FrameworkResponseDto, true) })
    async listFrameworks(): Promise<FrameworkResponseDto[]> {
        const frameworks = await this.frameworksService.findAll();

        return plainToInstance(FrameworkResponseDto, frameworks);
    }

    @Get(':id')
    @ApiOkResponse({ type: createCustomResponse(FrameworkResponseDto) })
    @ApiNotFoundResponse({ description: 'Framework not found' })
    @ApiParam({ name: 'id', type: 'integer' })
    async getFramework(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<FrameworkResponseDto> {
        const framework = await this.frameworksService.findById(id);
        if (!framework) {
            throw new NotFoundException('Framework not found');
        }

        return plainToInstance(FrameworkResponseDto, framework);
    }

    @Post()
    @UseGuards(AdminGuard)
    @ApiCreatedResponse({ type: createCustomResponse(FrameworkResponseDto) })
    @ApiForbiddenResponse({ description: 'Admin access required' })
    @ApiConflictResponse({
        description: 'Framework with this name already exists',
    })
    @ApiBody({ type: CreateFrameworkDto })
    async createFramework(
        @Body() createFrameworkDto: CreateFrameworkDto,
    ): Promise<FrameworkResponseDto> {
        const framework =
            await this.frameworksService.create(createFrameworkDto);

        return plainToInstance(FrameworkResponseDto, framework);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    @ApiOkResponse({ type: createCustomResponse(FrameworkResponseDto) })
    @ApiForbiddenResponse({ description: 'Admin access required' })
    @ApiNotFoundResponse({ description: 'Framework not found' })
    @ApiConflictResponse({
        description: 'Framework with this name already exists',
    })
    @ApiParam({ name: 'id', type: 'integer' })
    @ApiBody({ type: UpdateFrameworkDto })
    async updateFramework(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFrameworkDto: UpdateFrameworkDto,
    ): Promise<FrameworkResponseDto> {
        const framework = await this.frameworksService.update(
            id,
            updateFrameworkDto,
        );

        return plainToInstance(FrameworkResponseDto, framework);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiForbiddenResponse({ description: 'Admin access required' })
    @ApiNotFoundResponse({ description: 'Framework not found' })
    @ApiParam({ name: 'id', type: 'integer' })
    async deleteFramework(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.frameworksService.delete(id);
    }
}
