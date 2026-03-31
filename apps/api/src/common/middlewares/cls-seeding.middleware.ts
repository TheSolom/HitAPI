import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';
import { hrtime } from 'node:process';
import { getClientIp } from 'request-ip';
import type { AppClsStore } from '../../modules/logger/interfaces/logger.interface.js';

@Injectable()
export class ClsSeedingMiddleware implements NestMiddleware {
    constructor(private readonly cls: ClsService<AppClsStore>) {}

    use(req: Request, res: Response, next: NextFunction): void {
        const traceId = (req.headers['x-trace-id'] as string) ?? randomUUID();

        this.cls.set('traceId', traceId);
        this.cls.set('startTime', hrtime.bigint());
        this.cls.set('ip', getClientIp(req) ?? 'unknown');
        this.cls.set('userAgent', req.headers['user-agent'] ?? 'unknown');

        res.setHeader('x-trace-id', traceId);

        next();
    }
}
