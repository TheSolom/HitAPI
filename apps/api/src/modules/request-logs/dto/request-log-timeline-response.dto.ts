import { ApiProperty } from '@nestjs/swagger';

export class RequestLogTimelineResponseDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'integer', isArray: true })
    itemCounts: number[];
}
