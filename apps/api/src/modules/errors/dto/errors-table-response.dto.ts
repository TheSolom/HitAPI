import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RestfulMethod } from '@hitapi/shared/enums';
import type { ErrorsTableResponseDto as IErrorsTableResponseDto } from '@hitapi/types';

export class ErrorsTableResponseDto implements IErrorsTableResponseDto {
    @ApiProperty({ format: 'uuid' })
    @Expose()
    id: string;

    @ApiProperty({ enum: RestfulMethod })
    @Expose()
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    @Expose()
    path: string;

    @ApiProperty({ type: 'integer', minimum: 400, maximum: 599 })
    @Expose()
    statusCode: number;

    @ApiProperty({ type: 'string' })
    @Expose()
    statusText: string;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    requestCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    affectedConsumers: number;

    @ApiProperty({ type: 'boolean' })
    @Expose()
    expected: boolean;
}
