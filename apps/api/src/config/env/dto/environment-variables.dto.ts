import { Type } from 'class-transformer';
import {
    IsEnum,
    IsBoolean,
    IsInt,
    Min,
    Max,
    IsOptional,
    IsString,
    IsNotEmpty,
    IsUrl,
    IsEmail,
    ValidateIf,
} from 'class-validator';
import { Environment } from '../../../common/enums/environment.enum.js';

export class EnvironmentVariablesDto {
    // App Configuration
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    IGNORE_ENV_FILE?: boolean;

    @Type(() => Boolean)
    @IsBoolean()
    ENABLE_SWAGGER: boolean;

    @Type(() => Boolean)
    @IsBoolean()
    ENABLE_BULLBOARD: boolean;

    @Type(() => Number)
    @Min(3000)
    @Max(65535)
    @IsInt()
    @IsOptional()
    PORT?: number;

    @IsString()
    @IsOptional()
    HOST?: string;

    @IsUrl({ require_tld: false })
    @ValidateIf(
        (env: EnvironmentVariablesDto) =>
            env.NODE_ENV === Environment.Production ||
            env.APP_URL !== undefined,
    )
    APP_URL?: string;

    @IsString()
    @IsNotEmpty()
    APP_NAME: string;

    @IsString()
    @IsNotEmpty()
    API_PREFIX: string;

    @IsUrl({ require_tld: false })
    FRONTEND_URL: string;

    // Database Configuration
    @IsString()
    @IsNotEmpty()
    POSTGRES_HOST: string;

    @Type(() => Number)
    @Max(65535)
    @Min(1024)
    @IsInt()
    POSTGRES_PORT: number;

    @IsString()
    @IsNotEmpty()
    POSTGRES_USER: string;

    @IsString()
    @IsNotEmpty()
    POSTGRES_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    POSTGRES_DB: string;

    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    POSTGRES_SSL?: boolean;

    // Redis Configuration
    @IsString()
    @IsNotEmpty()
    REDIS_URL: string;

    @Type(() => Number)
    @Max(65535)
    @Min(1024)
    @IsInt()
    REDIS_PORT: number;

    // BullBoard Configuration
    @IsString()
    @IsNotEmpty()
    BULL_BOARD_USER: string;

    @IsString()
    @IsNotEmpty()
    BULL_BOARD_PASSWORD: string;

    // JWT Configuration
    @IsString()
    @IsNotEmpty()
    ACCESS_TOKEN_SECRET: string;

    @Type(() => Number)
    @Min(60)
    @IsInt()
    ACCESS_TOKEN_EXPIRATION_TIME: number;

    @Type(() => Number)
    @Min(60)
    @IsInt()
    REFRESH_TOKEN_EXPIRATION_TIME: number;

    @Type(() => Number)
    @Min(60)
    @IsInt()
    INVITE_EXPIRATION_TIME: number;

    // OAuth2 Configuration
    @IsUrl({ require_tld: false })
    OAUTH2_REDIRECT_URL: string;

    @IsString()
    @IsOptional()
    GOOGLE_CLIENT_ID?: string;

    @IsString()
    @IsOptional()
    GOOGLE_CLIENT_SECRET?: string;

    @IsUrl({ require_tld: false })
    GOOGLE_REDIRECT_URI: string;

    @IsUrl({ require_tld: false })
    GOOGLE_TOKEN_URL: string;

    // Mailer Configuration
    @IsString()
    @IsOptional()
    MAILER_REFRESH_TOKEN?: string;

    @IsString()
    @IsNotEmpty()
    MAILER_HOST: string;

    @Type(() => Number)
    @Max(65535)
    @Min(1)
    @IsInt()
    MAILER_PORT: number;

    @IsEmail()
    MAILER_USER: string;

    @IsEmail()
    MAILER_DEFAULT_EMAIL: string;

    @IsString()
    @IsNotEmpty()
    MAILER_DEFAULT_NAME: string;

    // Cache Configuration
    @Type(() => Number)
    @Min(60)
    @IsInt()
    CACHE_TTL_EMAIL_VERIFICATION: number;

    @Type(() => Number)
    @Min(60)
    @IsInt()
    CACHE_TTL_PASSWORD_RESET: number;
}
