import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { AuthenticatedUser as IAuthenticatedUser } from '@hitapi/types';

export class AuthenticatedUser implements IAuthenticatedUser {
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
}
