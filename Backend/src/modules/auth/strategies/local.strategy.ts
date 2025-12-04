import { Strategy } from 'passport-local';
import {
    Inject,
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Services } from '../../../common/constants/services.constant.js';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { EmailLoginDto } from '../dto/email-login.dto.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(
        @Inject(Services.AUTH) private readonly authService: IAuthService,
    ) {
        super({ usernameField: 'email', passReqToCallback: true });
    }

    async validate(req: Request): Promise<AuthenticatedUser> {
        const loginDto = plainToInstance(EmailLoginDto, req.body);
        const errors = await validate(loginDto);

        if (errors.length > 0) {
            const messages = this.formatValidationErrors(errors);
            throw new BadRequestException(messages);
        }

        const authUser = await this.authService.validateUser(loginDto);
        if (!authUser) throw new UnauthorizedException('Invalid credentials');

        return authUser;
    }

    private formatValidationErrors(errors: ValidationError[]): string[] {
        return errors.flatMap((err) =>
            err.constraints ? Object.values(err.constraints) : [],
        );
    }
}
