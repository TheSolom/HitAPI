import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomResponse<T> {
    @ApiProperty()
    statusCode: number;

    @ApiProperty()
    message: string;

    @ApiPropertyOptional()
    data?: T;
}
