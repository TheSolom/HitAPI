import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
    @ApiProperty({ type: 'string' })
    message: string;
}
