import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import type { ResendVerificationPayload } from '@hitapi/types';
import { lowerCaseTransformer } from '../../../../common/transformers/lower-case.transformer.js';

export class ResendVerificationDto implements ResendVerificationPayload {
    @ApiProperty({ format: 'email' })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    email: string;
}
