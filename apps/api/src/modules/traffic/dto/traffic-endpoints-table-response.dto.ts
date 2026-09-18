import { ApiProperty } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';
import type { TrafficEndpointsTableResponseDto as ITrafficEndpointsTableResponseDto } from '@hitapi/types';

export class TrafficEndpointsTableResponseDto implements ITrafficEndpointsTableResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ enum: RestfulMethod })
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    path: string;

    @ApiProperty({ type: 'integer' })
    totalRequestCount: number;

    @ApiProperty({ type: 'integer' })
    clientErrorCount: number;

    @ApiProperty({ type: 'integer' })
    serverErrorCount: number;

    @ApiProperty({ type: 'number' })
    errorRate: number;

    @ApiProperty({ type: 'number' })
    dataTransferred: number;

    @ApiProperty({ type: 'boolean' })
    excluded: boolean;

    @ApiProperty({ type: 'boolean' })
    removed: boolean;
}
