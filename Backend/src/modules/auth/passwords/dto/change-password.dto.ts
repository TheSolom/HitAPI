import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import {
    Match,
    DoesNotMatch,
} from '../../../../common/decorators/match.decorator.js';

export class ChangePasswordDto {
    @ApiProperty({ type: 'string' })
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({ type: 'string' })
    @MinLength(6)
    @DoesNotMatch('currentPassword', {
        message: 'New password must be different from current password',
    })
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
