import {
    Inject,
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Headers,
    Ip,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiInternalServerErrorResponse,
    ApiBody,
    ApiHeaders,
} from '@nestjs/swagger';
import { Routes } from '../../../common/constants/routes.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IRegistrationService } from './interfaces/registration-service.interface.js';
import { CustomResponse } from '../../../common/dto/custom-response.dto.js';
import { RegistrationDto } from './dto/registration.dto.js';
import { LoginTokensDto } from '../tokens/dto/login-tokens.dto.js';
import { VerifyEmailDto } from '../verification/dto/verify-email.dto.js';
import { ResendVerificationDto } from '../verification/dto/resend-verification.dto.js';
import { SkipResponseInterceptor } from '../../../common/decorators/skip-response-interceptor.decorator.js';

@ApiTags('Auth Registration')
@Controller(Routes.AUTH)
export class RegistrationController {
    constructor(
        @Inject(Services.REGISTRATION)
        private readonly registrationService: IRegistrationService,
    ) {}

    @Post('register')
    @ApiOkResponse({ type: CustomResponse<{ message: string }> })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiConflictResponse({ description: 'Email already registered' })
    @ApiInternalServerErrorResponse({
        description: 'Failed to send verification email',
    })
    @ApiBody({ type: RegistrationDto })
    async register(
        @Body() registrationDto: RegistrationDto,
    ): Promise<{ message: string }> {
        return this.registrationService.registerUser(registrationDto);
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @SkipResponseInterceptor()
    @ApiOkResponse({ type: LoginTokensDto })
    @ApiUnauthorizedResponse({ description: 'User not found' })
    @ApiBadRequestResponse({ description: 'Invalid token' })
    @ApiConflictResponse({ description: 'Email already registered' })
    @ApiInternalServerErrorResponse({
        description: 'Failed to send verification email',
    })
    @ApiBody({ type: VerifyEmailDto })
    @ApiHeaders([
        { name: 'user-agent', required: false },
        { name: 'ip', required: false },
    ])
    async verifyEmail(
        @Body() { token }: VerifyEmailDto,
        @Headers('user-agent') userAgent?: string,
        @Ip() ip?: string,
    ): Promise<LoginTokensDto> {
        return this.registrationService.verifyEmail(token, userAgent, ip);
    }

    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: CustomResponse<{ message: string }> })
    @ApiBadRequestResponse({
        description: 'User not found or email already verified',
    })
    @ApiInternalServerErrorResponse({
        description: 'Failed to send verification email',
    })
    @ApiBody({ type: ResendVerificationDto })
    async resendVerification(
        @Body() { email }: ResendVerificationDto,
    ): Promise<{ message: string }> {
        return this.registrationService.resendVerificationEmail(email);
    }
}
