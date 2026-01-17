import {
    Inject,
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Services } from '../../../../common/constants/services.constant.js';
import type { ITokensService } from '../interfaces/tokens-service.interface.js';
import { UserProfileDto } from '../../../users/dto/user-profile.dto.js';
import { LogoutDto } from '../../dto/logout.dto.js';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        @Inject(Services.TOKENS) private readonly tokensService: ITokensService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const { id: userId } = request.user as { id: UserProfileDto['id'] };

        const logoutDto = plainToInstance(LogoutDto, request.body);
        const errors = await validate(logoutDto);

        if (errors.length > 0) {
            const messages = this.formatValidationErrors(errors);
            throw new BadRequestException(messages);
        }

        const token = await this.tokensService.verifyRefreshToken(
            logoutDto.refreshToken,
            userId,
        );

        if (!token) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return true;
    }

    private formatValidationErrors(errors: ValidationError[]): string[] {
        return errors.flatMap((err) =>
            err.constraints ? Object.values(err.constraints) : [],
        );
    }
}
