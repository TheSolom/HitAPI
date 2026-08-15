import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { UserProfile } from '@hitapi/types';

export class UserProfileDto implements UserProfile {
    @Expose()
    @ApiProperty({ format: 'uuid' })
    id: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    displayName: string;

    @Expose()
    @ApiProperty({ format: 'email' })
    email: string;

    @Expose()
    @ApiProperty({ type: 'boolean' })
    isAdmin: boolean;

    @Expose()
    @ApiProperty({ type: 'boolean' })
    isVerified: boolean;

    @Expose()
    @ApiProperty({ type: Date })
    createdAt: Date;

    @Expose()
    @ApiProperty({ type: Date })
    updatedAt: Date;
}
