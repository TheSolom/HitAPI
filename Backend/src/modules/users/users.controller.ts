import { Inject, Controller, UseGuards, Get, Delete } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiOAuth2,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Services } from '../../common/constants/services.constant.js';
import type { IUsersService } from './interfaces/users-service.interface.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AuthUser } from './decorators/auth-user.decorator.js';
import { AuthenticatedUser } from './dto/auth-user.dto.js';
import { SocialAccountDto } from '../auth/social/dto/social-account.dto.js';
import { CustomResponse } from '../../common/dto/custom-response.dto.js';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(
        @Inject(Services.USERS) private readonly usersService: IUsersService,
    ) {}

    @Get('me')
    @ApiOkResponse({ type: CustomResponse<UserProfileDto> })
    async getUserProfile(
        @AuthUser() { id }: AuthenticatedUser,
    ): Promise<UserProfileDto> {
        const user = await this.usersService.findById(id, {
            requireVerified: true,
        });
        return plainToInstance(UserProfileDto, user);
    }

    @Get('me/social-accounts')
    @ApiOkResponse({ type: CustomResponse<SocialAccountDto>, isArray: true })
    async getSocialAccounts(
        @AuthUser() { id }: AuthenticatedUser,
    ): Promise<SocialAccountDto[]> {
        const accounts = await this.usersService.findUserSocialAccounts(id);

        return accounts.map((account) =>
            plainToInstance(SocialAccountDto, account),
        );
    }

    @Delete('me')
    @ApiNoContentResponse()
    async deleteUserProfile(
        @AuthUser() { id }: AuthenticatedUser,
    ): Promise<void> {
        await this.usersService.deleteUser(id);
    }
}
