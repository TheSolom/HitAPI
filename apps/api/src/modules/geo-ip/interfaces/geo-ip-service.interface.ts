import type { NullableType } from '@hitapi/types';
import type { CountryResponseDto } from '../dto/country-response.dto.js';

export interface IGeoIPService {
    /**
     * Get country's name and code by IP
     * @param ip IP address
     * @returns {NullableType<CountryResponseDto>} Country's details or null
     */
    getCountry(ip: string): NullableType<CountryResponseDto>;
}
