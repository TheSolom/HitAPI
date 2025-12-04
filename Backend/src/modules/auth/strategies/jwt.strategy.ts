import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../../../common/interfaces/env.interface.js';
import type { IJwtPayload } from '../tokens/interfaces/jwt-payload.interface.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService<Environment, true>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>(
                'ACCESS_TOKEN_SECRET',
            ),
        });
    }

    public validate(payload: IJwtPayload): AuthenticatedUser {
        return {
            id: payload.sub,
            email: payload.email,
            displayName: payload.displayName,
            isVerified: payload.isVerified,
            isAdmin: payload.isAdmin,
        };
    }
}
