import {
    Inject,
    Injectable,
    BadRequestException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { Services } from '../../../common/constants/services.constant.js';
import type { IRegistrationService } from './interfaces/registration-service.interface.js';
import type { IUsersService } from '../../users/interfaces/users-service.interface.js';
import type { ITokensService } from '../tokens/interfaces/tokens-service.interface.js';
import type { IHashingService } from '../../hashing/interfaces/hashing-service.interface.js';
import type { IEmailVerificationService } from '../verification/interfaces/email-verification-service.interface.js';
import { RegistrationDto } from './dto/registration.dto.js';
import { LoginTokensDto } from '../tokens/dto/login-tokens.dto.js';

@Injectable()
export class RegistrationService implements IRegistrationService {
    constructor(
        @Inject(Services.USERS)
        private readonly usersService: IUsersService,
        @Inject(Services.TOKENS)
        private readonly tokensService: ITokensService,
        @Inject(Services.EMAIL_VERIFICATION)
        private readonly emailVerificationService: IEmailVerificationService,
        @Inject(Services.HASHING)
        private readonly hashingService: IHashingService,
    ) {}

    private async createOrUpdateUser(
        registrationDto: RegistrationDto,
        hashedPassword: string,
    ): Promise<void> {
        const existingUser = await this.usersService.findByEmail(
            registrationDto.email,
        );

        if (existingUser) {
            if (existingUser.isVerified) {
                throw new ConflictException('Email already registered');
            }

            await this.usersService.updateUser(existingUser.id, {
                displayName: registrationDto.displayName,
                password: hashedPassword,
            });
        } else {
            await this.usersService.createUser({
                ...registrationDto,
                password: hashedPassword,
            });
        }
    }

    async registerUser(
        registrationDto: RegistrationDto,
    ): Promise<{ message: string }> {
        const hashedPassword = await this.hashingService.hashPassword(
            registrationDto.password,
        );

        await this.createOrUpdateUser(registrationDto, hashedPassword);

        await this.emailVerificationService.sendVerificationEmail(
            registrationDto.email,
            registrationDto.displayName,
        );

        return {
            message: 'Verification email sent',
        };
    }

    async verifyEmail(
        token: string,
        deviceInfo?: string,
        ipAddress?: string,
    ): Promise<LoginTokensDto> {
        const tokenData =
            await this.emailVerificationService.verifyEmail(token);

        const user = await this.usersService.findByEmail(tokenData.email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.isVerified) {
            throw new ConflictException('Email already verified');
        }

        user.isVerified = true;
        await this.usersService.saveUser(user);

        const tokens = await this.tokensService.generateTokenPair(
            user,
            deviceInfo,
            ipAddress,
        );

        return tokens;
    }

    async resendVerificationEmail(email: string): Promise<{ message: string }> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('Email already verified');
        }

        await this.emailVerificationService.sendVerificationEmail(
            email,
            user.displayName,
        );

        return {
            message: 'Verification email sent',
        };
    }
}
