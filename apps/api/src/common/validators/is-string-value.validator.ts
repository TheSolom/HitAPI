import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import ms, { type StringValue } from 'ms';

@ValidatorConstraint({ name: 'isStringValue', async: false })
export class IsStringValueConstraint implements ValidatorConstraintInterface {
    validate(value: unknown): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        try {
            const result = ms(value as StringValue);
            return typeof result === 'number' && result > 0;
        } catch {
            return false;
        }
    }

    defaultMessage(): string {
        return '$property must be a valid ms string value (e.g., "2 days", "1h")';
    }
}

export function IsStringValue(validationOptions?: ValidationOptions) {
    return function (target: object, propertyName: string) {
        registerDecorator({
            target: target.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: IsStringValueConstraint,
        });
    };
}
