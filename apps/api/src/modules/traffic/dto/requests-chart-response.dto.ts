import { ApiProperty } from '@nestjs/swagger';
import { ResponseStatus } from '../enums/response-status.enum.js';

export class RequestsChartResponseDto {
    @ApiProperty({ enum: ResponseStatus })
    responseStatus: ResponseStatus;

    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'number', isArray: true })
    requestCounts: number[];

    @ApiProperty({
        type: 'array',
        items: {
            type: 'array',
            items: { type: 'number', minItems: 2, maxItems: 2 },
        },
    })
    statusCodeCounts: Array<[number, number]>[];
}
