import { ApiProperty } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';

export class ErrorsTableResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ enum: RestfulMethod })
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    path: string;

    @ApiProperty({ type: 'integer', minimum: 400, maximum: 599 })
    statusCode: number;

    @ApiProperty({ type: 'string' })
    statusText: string;

    @ApiProperty({ type: 'integer', minimum: 0 })
    requestCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    affectedConsumers: number;

    @ApiProperty({ type: 'boolean' })
    expected: boolean;
}
