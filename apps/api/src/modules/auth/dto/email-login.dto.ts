import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../../common/transformers/lower-case.transformer.js';

export class EmailLoginDto {
    @ApiProperty({ format: 'email' })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    email: string;

    @ApiProperty({ type: 'string' })
    @Transform(({ value }: { value: string }) => value.trim())
    password: string;
}
