import type { RFC9457Response } from '@hitapi/types';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export interface FieldError {
    field: string;
    message: string;
}

export class ApiError extends Error {
    readonly status: number;
    readonly body: RFC9457Response | null;
    readonly fieldErrors: FieldError[];

    constructor(
        status: number,
        message: string,
        body: RFC9457Response | null,
        fieldErrors: FieldError[] = [],
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
        this.fieldErrors = fieldErrors;
    }

    get isUnauthorized(): boolean {
        return this.status === 401;
    }

    get isForbidden(): boolean {
        return this.status === 403;
    }

    get isNotFound(): boolean {
        return this.status === 404;
    }

    get isValidation(): boolean {
        return this.status === 422 || this.status === 400;
    }

    get isServerError(): boolean {
        return this.status >= 500;
    }
}

/**
 * Automatically maps server validation field errors from an ApiError into react-hook-form fields.
 * Returns true if at least one field error was set.
 */
export function applyFormErrors<TFieldValues extends FieldValues>(
    setError: UseFormSetError<TFieldValues>,
    error: unknown,
): boolean {
    if (!(error instanceof ApiError) || error.fieldErrors.length === 0) {
        return false;
    }

    for (const { field, message } of error.fieldErrors) {
        setError(field as Path<TFieldValues>, {
            type: 'server',
            message,
        });
    }

    return true;
}

