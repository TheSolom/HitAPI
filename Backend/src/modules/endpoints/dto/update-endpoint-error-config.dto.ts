import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class UpdateEndpointErrorConfigDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    method: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({ type: 'number' })
    @Max(599)
    @Min(100)
    @IsInt()
    @IsNotEmpty()
    statusCode: number;

    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    @IsNotEmpty()
    expected: boolean;
}
