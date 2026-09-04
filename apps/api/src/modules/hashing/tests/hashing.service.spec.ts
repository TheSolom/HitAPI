import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../hashing.service.js';

describe('HashingService', () => {
    let service: HashingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HashingService],
        }).compile();

        service = module.get<HashingService>(HashingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hash', () => {
        it('should hash a string using sha256', () => {
            const input = 'test-token';
            const hash1 = service.hash(input);
            const hash2 = service.hash(input);

            expect(hash1).toBeDefined();
            expect(typeof hash1).toBe('string');
            expect(hash1).toBe(hash2);
            expect(hash1.length).toBe(64);
        });
    });

    describe('hashPassword and verifyPassword', () => {
        it('should hash password and successfully verify it', async () => {
            const password = 'mySecretPassword123!';
            const hashedPassword = await service.hashPassword(password);

            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);

            const isValid = await service.verifyPassword(
                password,
                hashedPassword,
            );
            expect(isValid).toBe(true);

            const isInvalid = await service.verifyPassword(
                'wrongPassword',
                hashedPassword,
            );
            expect(isInvalid).toBe(false);
        });
    });
});
