import { createHash } from 'node:crypto';
import type {
    ConsumerMethodPath,
    ValidationError,
    ValidationErrorsItem,
} from '@hitapi/types';

export default class ValidationErrorCounter {
    readonly #errorCounts: Map<string, number>;
    readonly #errorDetails: Map<string, ConsumerMethodPath & ValidationError>;

    constructor() {
        this.#errorCounts = new Map();
        this.#errorDetails = new Map();
    }

    #getKey(validationError: ConsumerMethodPath & ValidationError): string {
        const SEPARATOR = '█';
        const hashInput = [
            validationError.consumer ?? '',
            validationError.method.toUpperCase(),
            validationError.path,
            validationError.loc.split('.').filter(Boolean),
            validationError.msg.trim(),
            validationError.type,
        ].join(SEPARATOR);

        return createHash('md5').update(hashInput).digest('hex');
    }

    public addValidationError(
        validationError: ConsumerMethodPath & ValidationError,
    ): void {
        const key = this.#getKey(validationError);
        if (!this.#errorDetails.has(key)) {
            this.#errorDetails.set(key, validationError);
        }

        this.#errorCounts.set(key, (this.#errorCounts.get(key) ?? 0) + 1);
    }

    public getAndResetValidationErrors(): ValidationErrorsItem[] {
        const data: ValidationErrorsItem[] = [];
        this.#errorCounts.forEach((count, key) => {
            const validationError = this.#errorDetails.get(key);
            if (validationError) {
                data.push({
                    consumer: validationError.consumer,
                    method: validationError.method,
                    path: validationError.path,
                    loc: validationError.loc.split('.').filter(Boolean),
                    msg: validationError.msg,
                    type: validationError.type,
                    errorCount: count,
                });
            }
        });

        this.#errorCounts.clear();
        this.#errorDetails.clear();
        return data;
    }
}
