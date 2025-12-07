import {
    Inject,
    Controller,
    Post,
    Patch,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiBody,
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Routes } from '../../../common/constants/routes.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IPasswordsService } from './interfaces/passwords-service.interface.js';
import { CustomResponse } from '../../../common/dto/custom-response.dto.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { AuthUser } from '../../users/decorators/auth-user.decorator.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { SetPasswordDto } from './dto/set-password.dto.js';

@ApiTags('Auth Passwords')
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@Controller(Routes.AUTH)
export class PasswordsController {
    constructor(
        @Inject(Services.PASSWORD)
        private readonly passwordService: IPasswordsService,
    ) {}

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ description: 'Password reset email sent' })
    @ApiUnauthorizedResponse({ description: 'User not found' })
    @ApiTooManyRequestsResponse({ description: 'Too many requests' })
    @ApiInternalServerErrorResponse({
        description:
            'Failed to send password reset email. Please try again later.',
    })
    @ApiBody({ type: CustomResponse<ForgotPasswordDto> })
    async forgotPassword(
        @Body() { email }: ForgotPasswordDto,
    ): Promise<{ message: string }> {
        return this.passwordService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ description: 'Password reset successfully' })
    @ApiUnauthorizedResponse({ description: 'User not found' })
    @ApiBadRequestResponse({ description: 'Invalid or expired token' })
    @ApiBody({ type: CustomResponse<ResetPasswordDto> })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        return this.passwordService.resetPassword(resetPasswordDto);
    }

    @Patch('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOkResponse({ description: 'Password changed successfully' })
    @ApiUnauthorizedResponse({ description: 'Wrong password' })
    @ApiBadRequestResponse({ description: 'User has no password set' })
    @ApiBody({ type: CustomResponse<ChangePasswordDto> })
    async changePassword(
        @Body() { currentPassword, newPassword }: ChangePasswordDto,
        @AuthUser() authUser: AuthenticatedUser,
    ): Promise<{ message: string }> {
        return this.passwordService.changePassword(
            authUser.id,
            currentPassword,
            newPassword,
        );
    }

    @Patch('set-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOkResponse({ description: 'Password set successfully' })
    @ApiUnauthorizedResponse({ description: 'User not found' })
    @ApiBadRequestResponse({ description: 'User already has a password' })
    @ApiBody({ type: CustomResponse<SetPasswordDto> })
    async setPassword(
        @Body() { newPassword }: SetPasswordDto,
        @AuthUser() authUser: AuthenticatedUser,
    ): Promise<{ message: string }> {
        return this.passwordService.setPassword(authUser.id, newPassword);
    }
}
