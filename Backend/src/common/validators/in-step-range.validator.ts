import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

export function InStepRange(
    step: number,
    min: number,
    max: number,
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'inStepRange',
            target: object.constructor,
            propertyName,
            constraints: [step, min, max],
            options: validationOptions,
            validator: {
                validate(value: number, args: ValidationArguments) {
                    if (typeof value !== 'number' || Number.isNaN(value)) {
                        return false;
                    }

                    const [step, min, max] = args.constraints as number[];

                    if (value < min || value > max) {
                        return false;
                    }

                    return (value - min) % step === 0;
                },

                defaultMessage(args: ValidationArguments) {
                    const value = args.value as number;
                    const [step, min, max] = args.constraints as number[];

                    const remainder = (value - min) % step;
                    const lower = value - remainder;
                    const higher = lower + step;

                    if (lower < min) {
                        return `Please enter a valid value. The nearest valid value is ${higher}.`;
                    }

                    if (higher > max) {
                        return `Please enter a valid value. The nearest valid value is ${lower}.`;
                    }

                    return `Please enter a valid value. The two nearest valid values are ${lower} and ${higher}.`;
                },
            },
        });
    };
}
