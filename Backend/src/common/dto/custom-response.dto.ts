import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomResponse<T> {
    @ApiProperty({ default: 200 })
    statusCode: number;

    @ApiProperty({ default: 'Success' })
    message: string;

    @ApiPropertyOptional()
    data?: T;
}
