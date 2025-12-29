import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CountryResponseDto {
    @Expose()
    @ApiProperty({ type: String })
    countryCode: string;

    @Expose()
    @ApiProperty({ type: String })
    countryName: string;
}
