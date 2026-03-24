/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, SelectQueryBuilder } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from '../users.service.js';
import type { IUsersService } from '../interfaces/users-service.interface.js';
import type { ISocialAccountsService } from '../interfaces/social-account-service.interface.js';
import { Services } from '../../../common/constants/services.constant.js';
import { SocialAccount } from '../entities/social-account.entity.js';
import { User } from '../entities/user.entity.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { AuthProvidersEnum } from '../../auth/enums/auth-providers.enum.js';

const mockSocialAccountsService = (): jest.Mocked<ISocialAccountsService> => ({
    findBySocialId: jest.fn(),
    findAllByUserId: jest.fn(),
    createOrUpdate: jest.fn(),
    hasMultipleLoginMethods: jest.fn(),
    unlinkAccount: jest.fn(),
});

const mockUserRepository = () => ({
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
});

describe('UsersService', () => {
    let usersService: IUsersService;
    let userRepository: jest.Mocked<Repository<User>>;
    let socialAccountsService: jest.Mocked<ISocialAccountsService>;
    let queryBuilderMock: jest.Mocked<
        Pick<
            SelectQueryBuilder<User>,
            'where' | 'andWhere' | 'addSelect' | 'leftJoinAndSelect' | 'getOne'
        >
    >;

    beforeEach(async () => {
        queryBuilderMock = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        } as unknown as typeof queryBuilderMock;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useFactory: () => ({
                        ...mockUserRepository(),
                        createQueryBuilder: jest
                            .fn()
                            .mockReturnValue(queryBuilderMock),
                    }),
                },
                {
                    provide: Services.SOCIAL_ACCOUNTS,
                    useFactory: mockSocialAccountsService,
                },
            ],
        }).compile();

        usersService = module.get<IUsersService>(UsersService);
        userRepository = module.get(getRepositoryToken(User));
        socialAccountsService = module.get(Services.SOCIAL_ACCOUNTS);
    });

    it('should be defined', () => {
        expect(usersService).toBeDefined();
    });

    describe('findById', () => {
        it('should return a user when found', async () => {
            const user = { id: '1', email: 'test@example.com' } as User;
            queryBuilderMock.getOne.mockResolvedValue(user);

            const result = await usersService.findById('1');

            expect(result).toEqual(user);
            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith(
                'user',
            );
            expect(queryBuilderMock.where).toHaveBeenCalledWith(
                'user.id = :id',
                { id: '1' },
            );
        });

        it('should return null when no user matches the id', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            const result = await usersService.findById('nonexistent-id');

            expect(result).toBeNull();
        });

        it('should select password field when includePassword is true', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            await usersService.findById('1', { includePassword: true });

            expect(queryBuilderMock.addSelect).toHaveBeenCalledWith(
                'user.password',
            );
        });

        it('should not select password field when includePassword is false', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            await usersService.findById('1', { includePassword: false });

            expect(queryBuilderMock.addSelect).not.toHaveBeenCalled();
        });

        it('should join social accounts when includeSocialAccounts is true', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            await usersService.findById('1', { includeSocialAccounts: true });

            expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith(
                'user.socialAccounts',
                'socialAccounts',
            );
        });

        it('should filter by verified status when requireVerified is true', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            await usersService.findById('1', { requireVerified: true });

            expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
                'user.verified = :isVerified',
                { isVerified: true },
            );
        });

        it('should filter by admin status when requireAdmin is true', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            await usersService.findById('1', { requireAdmin: true });

            expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
                'user.admin = :isAdmin',
                { isAdmin: true },
            );
        });
    });

    describe('findByEmail', () => {
        it('should return a user when found', async () => {
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

        it('should return null when no user matches the email', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            const result = await usersService.findByEmail(
                'notfound@example.com',
            );

            expect(result).toBeNull();
        });

        it('should select password field when includePassword is true', async () => {
            queryBuilderMock.getOne.mockResolvedValue(null);

            await usersService.findByEmail('test@example.com', {
                includePassword: true,
            });

            expect(queryBuilderMock.addSelect).toHaveBeenCalledWith(
                'user.password',
            );
        });
    });

    describe('findUserSocialAccounts', () => {
        it('should return social accounts for a given user', async () => {
            const accounts: SocialAccount[] = [
                {
                    id: '1',
                    provider: AuthProvidersEnum.GOOGLE,
                    socialId: 'google-123',
                    user: {} as User,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            socialAccountsService.findAllByUserId.mockResolvedValue(accounts);

            const result = await usersService.findUserSocialAccounts('1');

            expect(result).toEqual(accounts);
            expect(socialAccountsService.findAllByUserId).toHaveBeenCalledWith(
                '1',
            );
        });

        it('should return an empty array when user has no social accounts', async () => {
            socialAccountsService.findAllByUserId.mockResolvedValue([]);

            const result = await usersService.findUserSocialAccounts('1');

            expect(result).toEqual([]);
            expect(socialAccountsService.findAllByUserId).toHaveBeenCalledWith(
                '1',
            );
        });
    });

    describe('createUser', () => {
        it('should create and return a user when email does not exist', async () => {
            const createUserDto: CreateUserDto = {
                displayName: 'New User',
                email: 'new@example.com',
                password: 'password',
                verified: true,
                admin: false,
            };
            const createdUser = {
                id: '1',
                ...createUserDto,
            } as unknown as User;

            userRepository.findOne.mockResolvedValue(null);
            userRepository.create.mockReturnValue(createdUser);
            userRepository.save.mockResolvedValue(createdUser);

            const result = await usersService.createUser(createUserDto);

            expect(result).toEqual(createdUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
            expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
            expect(userRepository.save).toHaveBeenCalledWith(createdUser);
        });

        it('should throw ConflictException when user with that email already exists', async () => {
            const createUserDto: CreateUserDto = {
                email: 'existing@example.com',
                displayName: 'Existing User',
            };
            userRepository.findOne.mockResolvedValue({ id: '1' } as User);

            await expect(
                usersService.createUser(createUserDto),
            ).rejects.toThrow(ConflictException);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
            expect(userRepository.create).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('updateUser', () => {
        it('should merge id with dto, create entity, and save it', async () => {
            const updateUserDto: UpdateUserDto = {
                displayName: 'Updated Name',
            };
            const mergedUser = {
                id: '1',
                displayName: 'Updated Name',
            } as User;

            userRepository.create.mockReturnValue(mergedUser);
            userRepository.save.mockResolvedValue(mergedUser);

            const result = await usersService.updateUser('1', updateUserDto);

            expect(result).toEqual(mergedUser);
            expect(userRepository.create).toHaveBeenCalledWith({
                id: '1',
                ...updateUserDto,
            });
            expect(userRepository.save).toHaveBeenCalledWith(mergedUser);
        });
    });

    describe('deleteUser', () => {
        it('should soft delete the user by id', async () => {
            userRepository.softDelete.mockResolvedValue({
                affected: 1,
                raw: [],
                generatedMaps: [],
            } as UpdateResult);

            await usersService.deleteUser('1');

            expect(userRepository.softDelete).toHaveBeenCalledWith('1');
        });

        it('should not throw when deleting a non-existent user', async () => {
            userRepository.softDelete.mockResolvedValue({
                affected: 0,
                raw: [],
                generatedMaps: [],
            } as UpdateResult);

            await expect(
                usersService.deleteUser('nonexistent'),
            ).resolves.not.toThrow();
            expect(userRepository.softDelete).toHaveBeenCalledWith(
                'nonexistent',
            );
        });
    });
});
