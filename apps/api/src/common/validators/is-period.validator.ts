import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';
import ms, { type StringValue } from 'ms';

export function IsPeriod(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsPeriod',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    if (typeof value !== 'string') return false;

                    // relative period
                    if (typeof ms(value as StringValue) === 'number') {
                        return true;
                    }

                    // range period
                    const decoded = decodeURIComponent(value);
                    const [start, end] = decoded.split('|');
                    if (!start || !end) return false;

                    const startDate = new Date(start);
                    const endDate = new Date(end);

                    return (
                        !Number.isNaN(startDate.getTime()) &&
                        !Number.isNaN(endDate.getTime()) &&
                        startDate <= endDate
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a relative period (e.g. 24h) or a range (start|end)`;
                },
            },
        });
    };
}
