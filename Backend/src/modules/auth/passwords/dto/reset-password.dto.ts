import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Match } from '../../../../common/decorators/match.decorator.js';

export class ResetPasswordDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ type: 'string' })
    @MinLength(6)
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @ApiProperty({ type: 'string' })
    @Match('newPassword', {
        message: 'Confirm password must match new password',
    })
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}
