import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import type { ValidationErrorsTableResponseDto as IValidationErrorsTableResponseDto } from '@hitapi/types';

export class ValidationErrorsTableResponseDto implements IValidationErrorsTableResponseDto {
    @ApiProperty({ type: 'string' })
    @Expose()
    msg: string;

    @ApiProperty({ type: 'string' })
    @Expose()
    type: string;

    @ApiProperty({ type: 'string', isArray: true })
    @Transform(({ value }: { value: unknown }) => {
        if (Array.isArray(value)) {
            return value as string[];
        }
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value) as unknown;
                if (Array.isArray(parsed)) {
                    return parsed as string[];
                }
            } catch {
                return [value];
            }
        }
        return [];
    })
    @Expose()
    loc: string[];

    @ApiProperty({ type: 'integer' })
    @Expose()
    errorCount: number;
}
