import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { lowerCaseTransformer } from '../../../common/transformers/lower-case.transformer.js';

export class CreateUserDto {
    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    displayName: string;

    @ApiProperty({ format: 'email' })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    email: string;

    @ApiProperty({ type: 'string' })
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ type: 'boolean' })
    admin?: boolean;

    @ApiPropertyOptional({ type: 'boolean' })
    verified?: boolean;
}
