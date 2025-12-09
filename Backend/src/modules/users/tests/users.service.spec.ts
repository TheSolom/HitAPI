import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, SelectQueryBuilder } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from '../users.service.js';
import type { ISocialAccountsService } from '../interfaces/social-account-service.interface.js';
import { Services } from '../../../common/constants/services.constant.js';
import { SocialAccount } from '../entities/social-account.entity.js';
import { User } from '../entities/user.entity.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { AuthProvidersEnum } from '../../auth/enums/auth-providers.enum.js';

const mockSocialAccountsService = () => ({
    findAllByUserId: jest.fn(),
});

const mockUserRepository = () => ({
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
});

describe('UsersService', () => {
    let usersService: UsersService;
    let userRepository: Repository<User>;
    let socialAccountsService: ISocialAccountsService;
    let queryBuilderMock: Partial<SelectQueryBuilder<User>>;

    beforeEach(async () => {
        queryBuilderMock = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        } as unknown as Partial<SelectQueryBuilder<User>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useFactory: () => ({
                        ...mockUserRepository(),
                        createQueryBuilder: jest.fn(
                            () => queryBuilderMock as SelectQueryBuilder<User>,
                        ),
                    }),
                },
                {
                    provide: Services.SOCIAL_ACCOUNTS,
                    useFactory: mockSocialAccountsService,
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        socialAccountsService = module.get<ISocialAccountsService>(
            Services.SOCIAL_ACCOUNTS,
        );
    });

    it('should be defined', () => {
        expect(usersService).toBeDefined();
    });

    describe('findById', () => {
        it('should return a user if found', async () => {
            const user = { id: '1', email: 'test@example.com' } as User;
            queryBuilderMock.getOne.mockResolvedValue(user);

            const result = await usersService.findById('1');
            expect(result).toEqual(user);
            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith(
                'user',
            );
            expect(queryBuilderMock.where).toHaveBeenCalledWith(
                'user.id = :id',
                {
                    id: '1',
                },
            );
        });

        it('should return null if not found', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            const result = await usersService.findById('1');
            expect(result).toBeNull();
        });

        it('should include password if requested', async () => {
            await usersService.findById('1', { includePassword: true });
            expect(queryBuilderMock.addSelect).toHaveBeenCalledWith(
                'user.password',
            );
        });

        it('should include social accounts if requested', async () => {
            await usersService.findById('1', { includeSocialAccounts: true });
            expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith(
                'user.socialAccounts',
                'socialAccounts',
            );
        });

        it('should filter by verified status if requested', async () => {
            await usersService.findById('1', { requireVerified: true });
            expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
                'user.verified = :isVerified',
                { isVerified: true },
            );
        });

        it('should filter by admin status if requested', async () => {
            await usersService.findById('1', { requireAdmin: true });
            expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
                'user.admin = :isAdmin',
                { isAdmin: true },
            );
        });
    });

    describe('findByEmail', () => {
        it('should return a user if found', async () => {
            const user = { id: '1', email: 'test@example.com' } as User;
            queryBuilderMock.getOne.mockResolvedValue(user);

            const result = await usersService.findByEmail('test@example.com');
            expect(result).toEqual(user);
            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith(
                'user',
            );
            expect(queryBuilderMock.where).toHaveBeenCalledWith(
                'user.email = :email',
                { email: 'test@example.com' },
            );
        });

        it('should return null if not found', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            const result = await usersService.findByEmail('test@example.com');
            expect(result).toBeNull();
        });

        it('should include password if requested', async () => {
            await usersService.findByEmail('test@example.com', {
                includePassword: true,
            });
            expect(queryBuilderMock.addSelect).toHaveBeenCalledWith(
                'user.password',
            );
        });
    });

    describe('findUserSocialAccounts', () => {
        it('should return social accounts', async () => {
            const accounts = [
                {
                    id: '1',
                    provider: AuthProvidersEnum.GOOGLE,
                    socialId: 'google-123',
                    user: {} as User,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ] as SocialAccount[];
            const findAllByUserIdSpy = jest
                .spyOn(socialAccountsService, 'findAllByUserId')
                .mockResolvedValue(accounts);

            const result = await usersService.findUserSocialAccounts('1');
            expect(result).toEqual(accounts);
            expect(findAllByUserIdSpy).toHaveBeenCalledWith('1');
        });
    });

    describe('createUser', () => {
        it('should create a user if email does not exist', async () => {
            const createUserDto: CreateUserDto = {
                displayName: 'New User',
                email: 'new@example.com',
                password: 'password',
                verified: true,
                admin: false,
            };
            const savedUser = {
                id: '1',
                displayName: createUserDto.displayName,
                email: createUserDto.email,
                password: createUserDto.password,
                socialAccounts: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                previousPassword: undefined,
                isVerified: createUserDto.verified ?? false,
                isAdmin: createUserDto.admin ?? false,
                loadPreviousPassword: jest.fn(),
                updatePreviousPassword: jest.fn(),
                hasPassword: jest.fn().mockReturnValue(true),
            } as unknown as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
            const createSpy = jest
                .spyOn(userRepository, 'create')
                .mockReturnValue(savedUser);
            const saveSpy = jest
                .spyOn(userRepository, 'save')
                .mockResolvedValue(savedUser);

            const result = await usersService.createUser(createUserDto);
            expect(result).toEqual(savedUser);
            expect(createSpy).toHaveBeenCalledWith(createUserDto);
            expect(saveSpy).toHaveBeenCalledWith(savedUser);
        });

        it('should throw ConflictException if user already exists', async () => {
            const createUserDto: CreateUserDto = {
                email: 'existing@example.com',
                displayName: 'Existing User',
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue({
                id: '1',
            } as User);

            await expect(
                usersService.createUser(createUserDto),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('updateUser', () => {
        it('should update and save user', async () => {
            const updateUserDto: UpdateUserDto = {
                displayName: 'Updated Name',
            };
            const user = { id: '1', displayName: 'Updated Name' } as User;

            const createSpy = jest
                .spyOn(userRepository, 'create')
                .mockReturnValue(user);
            const saveSpy = jest
                .spyOn(userRepository, 'save')
                .mockResolvedValue(user);

            const result = await usersService.updateUser('1', updateUserDto);
            expect(result).toEqual(user);
            expect(createSpy).toHaveBeenCalledWith({
                id: '1',
                ...updateUserDto,
            });
            expect(saveSpy).toHaveBeenCalledWith(user);
        });
    });

    describe('deleteUser', () => {
        it('should soft delete user', async () => {
            const softDeleteSpy = jest
                .spyOn(userRepository, 'softDelete')
                .mockResolvedValue({
                    affected: 1,
                    raw: [],
                    generatedMaps: [],
                } as UpdateResult);
            await usersService.deleteUser('1');
            expect(softDeleteSpy).toHaveBeenCalledWith('1');
        });
    });
});
