import { IsEmail, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../../common/transformers/lower-case.transformer.js';

export class CreateTeamInviteDto {
    @ApiProperty({ format: 'email' })
    @Transform(lowerCaseTransformer)
    @IsEmail()
    email: string;

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    memberId: string;
}
