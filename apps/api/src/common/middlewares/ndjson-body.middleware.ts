import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class NdjsonBodyMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction): void {
        const isNdjson = req.headers['content-type']?.includes('ndjson');

        if (!isNdjson) return next();

        try {
            const raw = Buffer.isBuffer(req.body)
                ? req.body.toString('utf8')
                : String(req.body);

            req.body = raw
                .split('\n')
                .filter((line) => line.trim())
                .flatMap((line) => {
                    try {
                        return [JSON.parse(line) as unknown];
                    } catch {
                        return [];
                    }
                });
        } catch {
            // leave body as-is, let controller handle it
        }

        next();
    }
}
