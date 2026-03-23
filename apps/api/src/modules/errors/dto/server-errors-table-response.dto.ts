import { ApiProperty } from '@nestjs/swagger';

export class ServerErrorsTableResponseDto {
    @ApiProperty({ type: 'string' })
    msg: string;

    @ApiProperty({ type: 'string' })
    type: string;

    @ApiProperty({ type: 'string' })
    traceback: string;

    @ApiProperty({ type: 'integer' })
    errorCount: number;
}
