import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';

export class UpdateEndpointErrorConfigDto {
    @ApiProperty({ enum: RestfulMethods })
    @IsEnum(RestfulMethods)
    @IsNotEmpty()
    method: RestfulMethods;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({ type: 'integer' })
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
