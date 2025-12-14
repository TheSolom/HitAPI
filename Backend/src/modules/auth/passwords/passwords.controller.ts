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
    @ApiOkResponse({ type: CustomResponse<{ message: string }> })
    @ApiUnauthorizedResponse({ description: 'User not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiBody({ type: ForgotPasswordDto })
    async forgotPassword(
        @Body() { email }: ForgotPasswordDto,
    ): Promise<{ message: string }> {
        return this.passwordService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: CustomResponse<{ message: string }> })
    @ApiUnauthorizedResponse({ description: 'User not found' })
    @ApiBadRequestResponse({ description: 'Invalid or expired token' })
    @ApiBody({ type: ResetPasswordDto })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        return this.passwordService.resetPassword(resetPasswordDto);
    }

    @Patch('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOkResponse({ type: CustomResponse<{ message: string }> })
    @ApiUnauthorizedResponse({ description: 'Wrong password' })
    @ApiBadRequestResponse({ description: 'User has no password set' })
    @ApiBody({ type: ChangePasswordDto })
    async changePassword(
        @AuthUser() authUser: AuthenticatedUser,
        @Body() { currentPassword, newPassword }: ChangePasswordDto,
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
    @ApiOkResponse({ type: CustomResponse<{ message: string }> })
    @ApiUnauthorizedResponse({ description: 'User not found' })
    @ApiBadRequestResponse({ description: 'User already has a password' })
    @ApiBody({ type: SetPasswordDto })
    async setPassword(
        @AuthUser() authUser: AuthenticatedUser,
        @Body() { newPassword }: SetPasswordDto,
    ): Promise<{ message: string }> {
        return this.passwordService.setPassword(authUser.id, newPassword);
    }
}
