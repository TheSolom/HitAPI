import {
    Injectable,
    ConflictException,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util.js';
import type { ITeamInvitesService } from './interfaces/team-invites-service.interfaces.js';
import { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IHashingService } from '../hashing/interfaces/hashing-service.interface.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import { TeamInvite } from './entities/team-invite.entity.js';
import { InviteStatus } from './enums/invite-status.enum.js';

@Injectable()
export class TeamInvitesService implements ITeamInvitesService {
    constructor(
        @InjectRepository(TeamInvite)
        private readonly invitesRepository: Repository<TeamInvite>,
        @Inject(Services.HASHING)
        private readonly hashingService: IHashingService,
        private readonly configService: ConfigService<
            EnvironmentVariablesDto,
            true
        >,
    ) {}

    private async saveInvite(invite: TeamInvite): Promise<TeamInvite> {
        return this.invitesRepository.save(invite);
    }

    async findAllByTeam(
        teamId: TeamInvite['team']['id'],
    ): Promise<TeamInvite[]> {
        return this.invitesRepository.find({
            where: { team: { id: teamId } },
            order: { createdAt: 'DESC' },
            relations: ['inviter', 'inviter.user'],
        });
    }

    async findById(
        teamId: TeamInvite['team']['id'],
        id: TeamInvite['id'],
    ): Promise<NullableType<TeamInvite>> {
        return this.invitesRepository.findOne({
            where: { team: { id: teamId }, id },
            relations: ['inviter', 'inviter.user'],
        });
    }

    async findByEmail(
        teamId: TeamInvite['team']['id'],
        email: TeamInvite['email'],
    ): Promise<NullableType<TeamInvite>> {
        return this.invitesRepository.findOne({
            where: { team: { id: teamId }, email },
            relations: ['inviter', 'inviter.user'],
        });
    }

    async findByToken(token: string): Promise<NullableType<TeamInvite>> {
        return this.invitesRepository.findOne({
            where: { tokenHash: this.hashingService.hash(token) },
            select: ['email', 'expiresAt', 'team'],
            relations: ['team'],
        });
    }

    async createInvite(
        teamId: TeamInvite['team']['id'],
        email: TeamInvite['email'],
        inviterId: TeamInvite['inviter']['id'],
    ): Promise<{ invite: TeamInvite; token: string }> {
        const existingInvite = await this.findByEmail(teamId, email);
        if (existingInvite)
            throw new ConflictException('Invite already exists');

        const token = randomStringGenerator();
        const tokenHash = this.hashingService.hash(token);

        const inviteExpiresIn = this.configService.getOrThrow<number>(
            'INVITE_EXPIRATION_TIME',
        );

        const invite = await this.saveInvite(
            this.invitesRepository.create({
                tokenHash,
                email,
                status: InviteStatus.PENDING,
                team: { id: teamId },
                inviter: { id: inviterId },
                expiresAt: new Date(Date.now() + inviteExpiresIn * 1000),
            }),
        );

        return { invite, token };
    }

    async verifyInvite(userEmail: string, token: string): Promise<TeamInvite> {
        const tokenHash = this.hashingService.hash(token);

        const invite = await this.invitesRepository.findOne({
            where: {
                email: userEmail,
                tokenHash,
                status: InviteStatus.PENDING,
                deletedAt: IsNull(),
            },
            relations: ['inviter', 'team'],
        });

        if (!invite) throw new NotFoundException('Invite not found');

        if (invite.expiresAt < new Date()) {
            await this.revokeInvite(invite.id);
            throw new BadRequestException('Invite expired');
        }

        return invite;
    }

    async updateInviteStatus(
        invite: TeamInvite,
        status: TeamInvite['status'],
    ): Promise<TeamInvite> {
        invite.status = status;
        return this.saveInvite(invite);
    }

    async revokeInvite(id: TeamInvite['id']): Promise<void> {
        await this.invitesRepository.update(
            {
                id,
            },
            {
                deletedAt: new Date(),
                status: InviteStatus.REVOKED,
            },
        );
    }
}
