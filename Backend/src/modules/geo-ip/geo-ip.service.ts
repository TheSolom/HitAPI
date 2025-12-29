import { Injectable, OnModuleInit } from '@nestjs/common';
import { open, type Reader, type CountryResponse } from 'maxmind';
import type { IGeoIPService } from './interfaces/geo-ip-service.interface.js';
import type { NullableType } from '../../common/@types/nullable.type.js';
import type { CountryResponseDto } from './dto/country-response.dto.js';

@Injectable()
export class GeoIPService implements OnModuleInit, IGeoIPService {
    private lookup: Reader<CountryResponse>;

    async onModuleInit() {
        const PATH = 'assets/GeoLite2-City_20251219/GeoLite2-City.mmdb';
        this.lookup = await open<CountryResponse>(PATH);
    }

    getCountry(ip: string): NullableType<CountryResponseDto> {
        try {
            const response = this.lookup.get(ip);

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
