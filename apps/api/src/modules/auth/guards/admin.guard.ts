import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest<Request>();

        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }

        if (!user.isAdmin) {
            throw new ForbiddenException('Admin access required');
        }

        return true;
    }
}
