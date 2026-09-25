import { ApiProperty } from '@nestjs/swagger';
import type { RequestLogTimelineResponseDto as IRequestLogTimelineResponseDto } from '@hitapi/types';

export class RequestLogTimelineResponseDto implements IRequestLogTimelineResponseDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'integer', isArray: true })
    itemCounts: number[];
}
