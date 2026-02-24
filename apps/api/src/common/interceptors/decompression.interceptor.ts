import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Request } from 'express';
import { GzipUtil } from '../utils/gzip.util.js';

@Injectable()
export class DecompressionInterceptor implements NestInterceptor {
    constructor(private readonly gzipUtil: GzipUtil) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest<Request>();
        const isGzipped = request.headers['content-encoding'] === 'gzip';

        if (request.body && isGzipped && Buffer.isBuffer(request.body)) {
            try {
                const decompressed = await this.gzipUtil.decompress(
                    request.body,
                );
                const rawContent = decompressed.toString('base64');
                request.body = this.parseJsonLines(rawContent);
            } catch {
                throw new BadRequestException('Invalid gzip data');
            }
        }

        return next.handle();
    }

    private parseJsonLines(content: string): unknown[] {
        const lines = content.split('\n').filter((line) => line.trim());
        const items: unknown[] = [];
        const parseErrors: Array<{ line: number; error: string }> = [];

        lines.forEach((line, index) => {
            try {
                items.push(JSON.parse(line));
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);
                parseErrors.push({
                    line: index + 1,
                    error: message,
                });
            }
        });

        if (parseErrors.length > 0 && items.length === 0) {
            throw new BadRequestException({
                message: 'Failed to parse JSON Lines',
                parseErrors,
            });
        }

        return items;
    }
}
