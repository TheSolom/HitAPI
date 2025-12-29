import type { NullableType } from '../../../common/@types/nullable.type.js';
import type { CountryResponseDto } from '../dto/country-response.dto.js';

export interface IGeoIPService {
    getCountry(ip: string): NullableType<CountryResponseDto>;
}
