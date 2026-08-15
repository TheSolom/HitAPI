import { ApiProperty } from '@nestjs/swagger';
import type { MessageResponse } from '@hitapi/types';

export class MessageResponseDto implements MessageResponse {
    @ApiProperty({ type: 'string' })
    message: string;
}
