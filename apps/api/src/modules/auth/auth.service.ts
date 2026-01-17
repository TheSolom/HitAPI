import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Services } from '../../common/constants/services.constant.js';
import type { IAuthService } from './interfaces/auth-service.interface.js';
import type { IUsersService } from '../users/interfaces/users-service.interface.js';
import type { IHashingService } from '../hashing/interfaces/hashing-service.interface.js';
import { EmailLoginDto } from './dto/email-login.dto.js';
import { AuthenticatedUser } from '../users/dto/auth-user.dto.js';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(Services.USERS) private readonly usersService: IUsersService,
        @Inject(Services.HASHING)
        private readonly hashingService: IHashingService,
    ) {}

    async validateUser(loginDto: EmailLoginDto): Promise<AuthenticatedUser> {
        const user = await this.usersService.findByEmail(loginDto.email, {
            includePassword: true,
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValidPassword = await this.hashingService.verifyPassword(
            loginDto.password,
            user.password!,
        );

        if (!isValidPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return plainToInstance(AuthenticatedUser, user);
    }
}
