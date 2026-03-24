import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsArray,
    IsObject,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PathInfoDto } from './path-info.dto.js';

export class StartupPayloadDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    messageUuid: string;

    @ApiProperty({ type: PathInfoDto, isArray: true })
    @Type(() => PathInfoDto)
    @ValidateNested({ each: true })
    @IsArray()
    paths: PathInfoDto[];

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'string' },
        example: { express: '4.0.0', node: '20.0.0' },
    })
    @IsObject()
    versions: Record<string, string>;

    @ApiProperty({ type: 'string', example: 'js:express' })
    @IsString()
    client: string;
}
