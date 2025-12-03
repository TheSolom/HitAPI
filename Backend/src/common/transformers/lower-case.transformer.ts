import { TransformFnParams } from 'class-transformer';
import type { MaybeType } from '../@types/maybe.type.js';

export const lowerCaseTransformer = (
    params: TransformFnParams,
): MaybeType<string> =>
    typeof params.value === 'string'
        ? params.value.trim().toLowerCase()
        : undefined;
