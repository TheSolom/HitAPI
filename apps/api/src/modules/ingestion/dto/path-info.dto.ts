import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { RestfulMethod } from '@hitapi/shared/enums';

export class PathInfoDto {
    @ApiProperty({ enum: RestfulMethod })
    @IsEnum(RestfulMethod)
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    @IsString()
    path: string;
}
