import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth.service.js';
import type { IUsersService } from '../../users/interfaces/users-service.interface.js';
import type { ITokensService } from '../tokens/interfaces/tokens-service.interface.js';
import type { IHashingService } from '../../hashing/interfaces/hashing-service.interface.js';
import { Services } from '../../../common/constants/services.constant.js';
import { User } from '../../users/entities/user.entity.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { LoginTokensDto } from '../tokens/dto/login-tokens.dto.js';
import { EmailLoginDto } from '../dto/email-login.dto.js';

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: jest.Mocked<
        Pick<IUsersService, 'findByEmail' | 'findById'>
    >;
    let tokensService: jest.Mocked<Pick<ITokensService, 'generateTokenPair'>>;
    let hashingService: jest.Mocked<Pick<IHashingService, 'verifyPassword'>>;

    const TEST_USER_ID = '1';
    const TEST_EMAIL = 'test@example.com';
    const TEST_PASSWORD = 'password123';
    const HASHED_PASSWORD = 'hashedPassword';
    const TEST_DEVICE = 'test-device';
    const TEST_IP = '127.0.0.1';
    const ACCESS_TOKEN = 'access-token';
    const REFRESH_TOKEN = 'refresh-token';

    const createMockUser = (overrides?: Partial<User>): User =>
        ({
            id: TEST_USER_ID,
            email: TEST_EMAIL,
            password: HASHED_PASSWORD,
            ...overrides,
        }) as User;

    const createMockTokens = (
        overrides?: Partial<LoginTokensDto>,
    ): LoginTokensDto => ({
        access_token: ACCESS_TOKEN,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: REFRESH_TOKEN,
        refresh_token_expires_in: 3600,
        ...overrides,
    });

    beforeEach(async () => {
        const usersServiceMock: jest.Mocked<
            Pick<IUsersService, 'findByEmail' | 'findById'>
        > = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
        };

        const tokensServiceMock: jest.Mocked<
            Pick<ITokensService, 'generateTokenPair'>
        > = {
            generateTokenPair: jest.fn(),
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
                    provide: Services.TOKENS,
                    useValue: tokensServiceMock,
                },
                {
                    provide: Services.HASHING,
                    useValue: hashingServiceMock,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get(Services.USERS);
        tokensService = module.get(Services.TOKENS);
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
            );
        });
    });

    describe('refreshToken', () => {
        it('should throw NotFoundException if user is not found', async () => {
            const user = createMockUser();

            usersService.findById.mockResolvedValue(null);

            await expect(
                tokensService.generateTokenPair(user, TEST_DEVICE, TEST_IP),
            ).rejects.toThrow(NotFoundException);

            expect(usersService.findById).toHaveBeenCalledWith(user.id);
            expect(usersService.findById).toHaveBeenCalledTimes(1);
            expect(tokensService.generateTokenPair).not.toHaveBeenCalled();
        });

        it('should return LoginTokensDto if user is found', async () => {
            const user = createMockUser();
            const tokens = createMockTokens();

            usersService.findById.mockResolvedValue(user);
            tokensService.generateTokenPair.mockResolvedValue(tokens);

            const result = await tokensService.generateTokenPair(
                user,
                TEST_DEVICE,
                TEST_IP,
            );

            expect(result).toEqual(tokens);
            expect(usersService.findById).toHaveBeenCalledWith(TEST_USER_ID);
            expect(tokensService.generateTokenPair).toHaveBeenCalledWith(
                user,
                TEST_DEVICE,
                TEST_IP,
            );
            expect(tokensService.generateTokenPair).toHaveBeenCalledTimes(1);
        });

        it('should handle different device info and IP addresses', async () => {
            const user = createMockUser();
            const tokens = createMockTokens();
            const differentDevice = 'mobile-device';
            const differentIp = '192.168.1.1';

            usersService.findById.mockResolvedValue(user);
            tokensService.generateTokenPair.mockResolvedValue(tokens);

            await tokensService.generateTokenPair(
                user,
                differentDevice,
                differentIp,
            );

            expect(tokensService.generateTokenPair).toHaveBeenCalledWith(
                user,
                differentDevice,
                differentIp,
            );
        });

        it('should propagate errors from token generation', async () => {
            const user = createMockUser();
            const tokenError = new Error('Token generation failed');

            usersService.findById.mockResolvedValue(user);
            tokensService.generateTokenPair.mockRejectedValue(tokenError);

            await expect(
                tokensService.generateTokenPair(user, TEST_DEVICE, TEST_IP),
            ).rejects.toThrow('Token generation failed');
        });
    });
});
