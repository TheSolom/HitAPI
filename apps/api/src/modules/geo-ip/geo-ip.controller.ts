import {
    UseGuards,
    Controller,
    Inject,
    Get,
    Ip,
    NotFoundException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOAuth2,
    ApiUnauthorizedResponse,
    ApiTooManyRequestsResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IGeoIPService } from './interfaces/geo-ip-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { CountryResponseDto } from './dto/country-response.dto.js';

@ApiTags('Geo IP')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.GEO_IP)
export class GeoIPController {
    constructor(
        @Inject(Services.GEO_IP) private readonly geoIpService: IGeoIPService,
    ) {}

    @Get('country')
    @ApiOkResponse({ type: createCustomResponse(CountryResponseDto) })
    @ApiNotFoundResponse({ description: 'Country not found' })
    getCountryCode(@Ip() ip: string): CountryResponseDto {
        const countryCode = this.geoIpService.getCountry(ip);
        if (!countryCode) throw new NotFoundException(`Country not found`);

        return plainToInstance(CountryResponseDto, countryCode);
    }
}
