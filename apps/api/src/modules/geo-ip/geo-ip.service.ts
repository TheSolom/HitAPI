import { Injectable, OnModuleInit } from '@nestjs/common';
import { open, type Reader, type CountryResponse } from 'maxmind';
import type { IGeoIPService } from './interfaces/geo-ip-service.interface.js';
import { AppLoggerService } from '../logger/logger.service.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import type { CountryResponseDto } from './dto/country-response.dto.js';

@Injectable()
export class GeoIPService implements OnModuleInit, IGeoIPService {
    private static lookup?: Reader<CountryResponse>;

    constructor(private readonly logger: AppLoggerService) {
        this.logger.setContext(GeoIPService.name);
    }

    async onModuleInit() {
        const PATH = 'assets/GeoLite2-Country_20260102/GeoLite2-Country.mmdb';

        if (GeoIPService.lookup) return;

        try {
            GeoIPService.lookup = await open<CountryResponse>(PATH);
        } catch (error) {
            this.logger.error('Failed to initialize GeoIP service', {
                error:
                    error instanceof Error
                        ? error.stack
                        : JSON.stringify(error),
            });
        }
    }

    getCountry(ip: string): NullableType<CountryResponseDto> {
        try {
            const response = GeoIPService.lookup?.get(ip);

            if (response?.country) {
                return {
                    countryCode: response.country.iso_code,
                    countryName: response.country.names.en,
                };
            }

            return null;
        } catch {
            return null;
        }
    }
}
