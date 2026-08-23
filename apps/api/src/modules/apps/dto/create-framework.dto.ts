import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import type { CreateFrameworkPayload } from '@hitapi/types';

export class CreateFrameworkDto implements CreateFrameworkPayload {
    @ApiProperty({ type: 'string', example: 'Fastify' })
    @IsString()
    @IsNotEmpty()
    name: string;
}
