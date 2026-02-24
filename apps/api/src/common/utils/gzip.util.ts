import { gzip, gunzip } from 'node:zlib';
import { promisify } from 'node:util';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class GzipUtil {
    async decompress(buffer: Buffer): Promise<Buffer> {
        try {
            return promisify(gunzip)(buffer);
        } catch {
            throw new BadRequestException('Invalid gzip data');
        }
    }

    async compress(data: Buffer): Promise<Buffer>;
    async compress(data: string): Promise<Buffer>;
    async compress(data: Buffer | string): Promise<Buffer> {
        const buffer = typeof data === 'string' ? Buffer.from(data) : data;
        return promisify(gzip)(buffer);
    }

    async parseJsonGzip<T>(
        buffer: Buffer,
        encoding: BufferEncoding = 'utf-8',
    ): Promise<T> {
        const decompressed = await this.decompress(buffer);
        const jsonString = decompressed.toString(encoding);

        try {
            return JSON.parse(jsonString) as T;
        } catch {
            throw new BadRequestException('Invalid JSON in gzip data');
        }
    }
}
