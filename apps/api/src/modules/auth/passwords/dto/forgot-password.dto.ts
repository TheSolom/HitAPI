import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../../../common/transformers/lower-case.transformer.js';

export class ForgotPasswordDto {
    @ApiProperty({ format: 'email' })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    email: string;
}
