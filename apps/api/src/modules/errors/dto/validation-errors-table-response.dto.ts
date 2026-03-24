import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorsTableResponseDto {
    @ApiProperty({ type: 'string' })
    msg: string;

    @ApiProperty({ type: 'string' })
    type: string;

    @ApiProperty({ type: 'string', isArray: true })
    loc: string[];

    @ApiProperty({ type: 'integer' })
    errorCount: number;
}
