import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

/**
 * Validates that the decorated property matches the value of another property
 * @param property - The name of the property to match against
 * @param validationOptions - Optional validation options
 * @example
 * class ChangePasswordDto {
 *   newPassword: string;
 *
 *   @Match('newPassword', { message: 'Passwords must match' })
 *   confirmPassword: string;
 * }
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'match',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints as [string];
                    const relatedValue = (
                        args.object as Record<string, unknown>
                    )[relatedPropertyName];
                    return value === relatedValue;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints as [string];
                    return `${propertyName} must match ${relatedPropertyName}`;
                },
            },
        });
    };
}
/**
 * Validates that the decorated property does NOT match the value of another property
 * @param property - The name of the property to compare against
 * @param validationOptions - Optional validation options
 * @example
 * class ChangePasswordDto {
 *   currentPassword: string;
 *
 *   @DoesNotMatch('currentPassword', { message: 'New password must be different' })
 *   newPassword: string;
 * }
 */
export function DoesNotMatch(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'doesNotMatch',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints as [string];
                    const relatedValue = (
                        args.object as Record<string, unknown>
                    )[relatedPropertyName];
                    return value !== relatedValue;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints as [string];
                    return `${propertyName} must be different from ${relatedPropertyName}`;
                },
            },
        });
    };
}
