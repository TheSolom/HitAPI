import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../../../common/transformers/lower-case.transformer.js';

export class SocialLoginDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    socialId: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @ApiProperty({ format: 'email' })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    email: string;

    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    @IsNotEmpty()
    isVerified: boolean;
}
