import { ApiProperty } from '@nestjs/swagger';
import type { AuthTokens } from '@hitapi/types';

export class LoginTokensDto implements AuthTokens {
    @ApiProperty({ type: 'string' })
    access_token: string;

    @ApiProperty({ type: 'string' })
    token_type: string;

    @ApiProperty({ type: 'number' })
    expires_in: number;

    @ApiProperty({ type: 'string' })
    refresh_token: string;

    @ApiProperty({ type: 'number' })
    refresh_token_expires_in: number;
}
