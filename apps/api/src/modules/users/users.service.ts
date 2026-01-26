import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { Services } from '../../common/constants/services.constant.js';
import type { ISocialAccountsService } from './interfaces/social-account-service.interface.js';
import type { IUsersService } from './interfaces/users-service.interface.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { SocialAccount } from './entities/social-account.entity.js';
import type { FindUserOptions } from './interfaces/find-user-options.interface.js';

@Injectable()
export class UsersService implements IUsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @Inject(Services.SOCIAL_ACCOUNTS)
        private readonly socialAccountsService: ISocialAccountsService,
    ) {}

    async findById(
        id: string,
        options: FindUserOptions = {},
    ): Promise<NullableType<User>> {
        const queryBuilder = this.usersRepository
            .createQueryBuilder('user')
            .where('user.id = :id', { id });

        if (options.includePassword) {
            queryBuilder.addSelect('user.password');
        }

        if (options.includeSocialAccounts) {
            queryBuilder.leftJoinAndSelect(
                'user.socialAccounts',
                'socialAccounts',
            );
        }

        if (options.requireVerified) {
            queryBuilder.andWhere('user.verified = :isVerified', {
                isVerified: true,
            });
        }

        if (options.requireAdmin) {
            queryBuilder.andWhere('user.admin = :isAdmin', {
                isAdmin: true,
            });
        }

        return queryBuilder.getOne();
    }

    async findByEmail(
        email: string,
        options: FindUserOptions = {},
    ): Promise<NullableType<User>> {
        const queryBuilder = this.usersRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email });

        if (options.includePassword) {
            queryBuilder.addSelect('user.password');
        }

        if (options.includeSocialAccounts) {
            queryBuilder.leftJoinAndSelect(
                'user.socialAccounts',
                'socialAccounts',
            );
        }

        if (options.requireVerified) {
            queryBuilder.andWhere('user.verified = :isVerified', {
                isVerified: true,
            });
        }

        if (options.requireAdmin) {
            queryBuilder.andWhere('user.admin = :isAdmin', {
                isAdmin: true,
            });
        }

        return queryBuilder.getOne();
    }

    async findUserSocialAccounts(userId: User['id']): Promise<SocialAccount[]> {
        return this.socialAccountsService.findAllByUserId(userId);
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) throw new ConflictException('User already exists');

        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }

    async updateUser(
        id: User['id'],
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.saveUser(
            this.usersRepository.create({
                id,
                ...updateUserDto,
            }),
        );
    }

    async deleteUser(id: User['id']): Promise<void> {
        await this.usersRepository.softDelete(id);
    }

    async saveUser(user: User): Promise<User> {
        return this.usersRepository.save(user);
    }
}
