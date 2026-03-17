import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service.js';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { IUsersService } from '../../users/interfaces/users-service.interface.js';
import type { IHashingService } from '../../hashing/interfaces/hashing-service.interface.js';
import { Services } from '../../../common/constants/services.constant.js';
import { User } from '../../users/entities/user.entity.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { EmailLoginDto } from '../dto/email-login.dto.js';

describe('AuthService', () => {
    let authService: IAuthService;
    let usersService: jest.Mocked<
        Pick<IUsersService, 'findByEmail' | 'findById'>
    >;
    let hashingService: jest.Mocked<Pick<IHashingService, 'verifyPassword'>>;

    const TEST_USER_ID = '1';
    const TEST_EMAIL = 'test@example.com';
    const TEST_PASSWORD = 'password123';
    const HASHED_PASSWORD = 'hashedPassword';

    const createMockUser = (overrides?: Partial<User>): User =>
        ({
            id: TEST_USER_ID,
            email: TEST_EMAIL,
            password: HASHED_PASSWORD,
            ...overrides,
        }) as User;

    beforeEach(async () => {
        const usersServiceMock: jest.Mocked<
            Pick<IUsersService, 'findByEmail' | 'findById'>
        > = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
        };

        const hashingServiceMock: jest.Mocked<
            Pick<IHashingService, 'verifyPassword'>
        > = {
            verifyPassword: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: Services.USERS,
                    useValue: usersServiceMock,
                },
                {
                    provide: Services.HASHING,
                    useValue: hashingServiceMock,
                },
            ],
        }).compile();

        authService = module.get<IAuthService>(AuthService);
        usersService = module.get(Services.USERS);
        hashingService = module.get(Services.HASHING);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    describe('validateUser', () => {
        const loginDto: EmailLoginDto = {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        };

        it('should throw UnauthorizedException if user is not found', async () => {
            usersService.findByEmail.mockResolvedValue(null);

            await expect(authService.validateUser(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(usersService.findByEmail).toHaveBeenCalledWith(
                loginDto.email,
                { includePassword: true },
            );
            expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
            expect(hashingService.verifyPassword).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            const user = createMockUser();

            usersService.findByEmail.mockResolvedValue(user);
            hashingService.verifyPassword.mockResolvedValue(false);

            await expect(authService.validateUser(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(usersService.findByEmail).toHaveBeenCalledWith(
                loginDto.email,
                { includePassword: true },
            );
            expect(hashingService.verifyPassword).toHaveBeenCalledWith(
                loginDto.password,
                user.password,
            );
            expect(hashingService.verifyPassword).toHaveBeenCalledTimes(1);
        });

        it('should return AuthenticatedUser if credentials are valid', async () => {
            const user = createMockUser();

            usersService.findByEmail.mockResolvedValue(user);
            hashingService.verifyPassword.mockResolvedValue(true);

            const result = await authService.validateUser(loginDto);

            expect(result).toBeInstanceOf(AuthenticatedUser);
            expect(result.email).toBe(user.email);
            expect(result.id).toBe(user.id);
            expect(usersService.findByEmail).toHaveBeenCalledWith(
                loginDto.email,
                { includePassword: true },
            );
            expect(hashingService.verifyPassword).toHaveBeenCalledWith(
                loginDto.password,
                user.password,
            );
        });

        it('should handle email case-insensitivity correctly', async () => {
            const upperCaseLoginDto: EmailLoginDto = {
                email: 'TEST@EXAMPLE.COM',
                password: TEST_PASSWORD,
            };
            const user = createMockUser();
            usersService.findByEmail.mockResolvedValue(user);
            hashingService.verifyPassword.mockResolvedValue(true);

            const result = await authService.validateUser(upperCaseLoginDto);

            expect(result).toBeInstanceOf(AuthenticatedUser);
            expect(usersService.findByEmail).toHaveBeenCalledWith(
                upperCaseLoginDto.email,
                { includePassword: true },
            );
        });
    });
});
