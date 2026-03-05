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
import { RestfulMethod } from '@hitapi/shared/enums';

export class UpdateEndpointErrorConfigDto {
    @ApiProperty({ enum: RestfulMethod })
    @IsEnum(RestfulMethod)
    @IsNotEmpty()
    method: RestfulMethod;

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
