import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { ServerErrorsTableResponseDto as IServerErrorsTableResponseDto } from '@hitapi/types';

export class ServerErrorsTableResponseDto implements IServerErrorsTableResponseDto {
    @ApiProperty({ type: 'string' })
    @Expose()
    msg: string;

    @ApiProperty({ type: 'string' })
    @Expose()
    type: string;

    @ApiProperty({ type: 'string' })
    @Expose()
    traceback: string;

    @ApiProperty({ type: 'integer' })
    @Expose()
    errorCount: number;
}
