import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import type { IHashingService } from './interfaces/hashing-service.interface.js';

@Injectable()
export class HashingService implements IHashingService {
    hash(string: string): string {
        return crypto.createHash('sha256').update(string).digest('hex');
    }

    async hashPassword(rawPassword: string): Promise<string> {
        return argon2.hash(rawPassword);
    }

    async verifyPassword(
        rawPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return argon2.verify(hashedPassword, rawPassword);
    }
}
