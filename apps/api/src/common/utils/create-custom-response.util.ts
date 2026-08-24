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
        if (isArray) {
            class CustomResponseArrayClass extends CustomResponse<T[]> {
                @ApiPropertyOptional({ type: dataType, isArray: true })
                declare data?: T[];
            }
            Object.defineProperty(CustomResponseArrayClass, 'name', {
                value: className,
            });
            return CustomResponseArrayClass;
        }

        class CustomResponseSingleClass extends CustomResponse<T> {
            @ApiPropertyOptional({ type: dataType, isArray: false })
            declare data?: T;
        }
        Object.defineProperty(CustomResponseSingleClass, 'name', {
            value: className,
        });
        return CustomResponseSingleClass;
    }

    class CustomResponseVoid extends CustomResponse<never> {}

    Object.defineProperty(CustomResponseVoid, 'name', { value: className });
    return CustomResponseVoid;
}
