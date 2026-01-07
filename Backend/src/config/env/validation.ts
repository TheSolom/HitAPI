import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EnvironmentVariablesDto } from './dto/environment-variables.dto.js';

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariablesDto, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
