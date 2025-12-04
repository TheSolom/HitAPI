import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../../../common/transformers/lower-case.transformer.js';

export class RegistrationDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @ApiProperty({ format: 'email' })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    email: string;

    @ApiProperty({ type: 'string' })
    @MinLength(6)
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    password: string;
}
