import { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CustomResponse } from '../dto/custom-response.dto.js';

export function createCustomResponse<T>(
    dataType: Type<T> | null,
    isArray: boolean = false,
) {
    const typeName = dataType ? dataType.name : 'Void';
    const className = `CustomResponseOf${typeName}${isArray ? 'Array' : ''}`;

    if (dataType) {
        class CustomResponseClass extends CustomResponse<T> {
            @ApiPropertyOptional({ type: dataType, isArray })
            declare data?: T;
        }

        Object.defineProperty(CustomResponseClass, 'name', {
            value: className,
        });
        return CustomResponseClass;
    }

    class CustomResponseVoid extends CustomResponse<T> {}

    Object.defineProperty(CustomResponseVoid, 'name', { value: className });
    return CustomResponseVoid;
}
