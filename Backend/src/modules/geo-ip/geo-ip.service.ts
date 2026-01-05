import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { open, type Reader, type CountryResponse } from 'maxmind';
import type { IGeoIPService } from './interfaces/geo-ip-service.interface.js';
import type { NullableType } from '../../common/@types/nullable.type.js';
import type { CountryResponseDto } from './dto/country-response.dto.js';

@Injectable()
export class GeoIPService implements OnModuleInit, IGeoIPService {
    private readonly logger = new Logger(GeoIPService.name);
    private lookup?: Reader<CountryResponse>;

    async onModuleInit() {
        const PATH = 'assets/GeoLite2-Country_20260102/GeoLite2-Country.mmdb';

        try {
            this.lookup = await open<CountryResponse>(PATH);
        } catch (error) {
            this.logger.error('Failed to initialize GeoIP service', error);
        }
    }

    getCountry(ip: string): NullableType<CountryResponseDto> {
        try {
            const response = this.lookup?.get(ip);

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
