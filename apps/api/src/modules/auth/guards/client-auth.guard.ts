import {
    Inject,
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Services } from '../../../common/constants/services.constant.js';
import type { IAppsService } from '../../apps/interfaces/apps-service.interface.js';

@Injectable()
export class ClientAuthGuard implements CanActivate {
    constructor(
        @Inject(Services.APPS) private readonly appsService: IAppsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const clientId = request.headers['x-client-id'] as string;

        if (!clientId) {
            throw new UnauthorizedException('Missing X-Client-ID header');
        }

        const app = await this.appsService.findByClientId(clientId);

        if (!app) {
            throw new UnauthorizedException('Invalid client ID');
        }

        if (!app.active) {
            throw new ForbiddenException('App is not active');
        }

        request.userApp = app;

        return true;
    }
}
