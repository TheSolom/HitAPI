import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { TeamInvitesService } from '../team-invites.service.js';
import type { ITeamInvitesService } from '../interfaces/team-invites-service.interfaces.js';
import { TeamInvite } from '../entities/team-invite.entity.js';
import { InviteStatus } from '../enums/invite-status.enum.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IHashingService } from '../../hashing/interfaces/hashing-service.interface.js';

const mockTeamId = 'team-uuid-123';
const mockInviterId = 'user-uuid-123';
const mockInviteId = 'invite-uuid-123';
const mockEmail = 'test@example.com';
const mockToken = 'random-token';
const mockHash = 'hashed-token';

const mockInvitesRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
});

const mockHashingService = () => ({
    hash: jest.fn().mockReturnValue(mockHash),
    compare: jest.fn(),
});

const mockConfigService = () => ({
    getOrThrow: jest.fn().mockReturnValue(86400), // 1 day in seconds
});

describe('TeamInvitesService', () => {
    let teamInvitesService: ITeamInvitesService;
    let invitesRepository: Repository<TeamInvite>;
    let hashingService: IHashingService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamInvitesService,
                {
                    provide: getRepositoryToken(TeamInvite),
                    useFactory: mockInvitesRepository,
                },
                {
                    provide: Services.HASHING,
                    useFactory: mockHashingService,
                },
                {
                    provide: ConfigService,
                    useFactory: mockConfigService,
                },
            ],
        }).compile();

        teamInvitesService =
            module.get<ITeamInvitesService>(TeamInvitesService);
        invitesRepository = module.get<Repository<TeamInvite>>(
            getRepositoryToken(TeamInvite),
        );
        hashingService = module.get<IHashingService>(Services.HASHING);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(teamInvitesService).toBeDefined();
    });

    describe('findAllByTeam', () => {
        it('should return pending invites for a given team', async () => {
            const mockInvites = [
                {
                    id: '1',
                    team: { id: mockTeamId },
                    inviter: { id: mockInviterId },
                } as TeamInvite,
            ];

            const findSpy = jest
                .spyOn(invitesRepository, 'find')
                .mockResolvedValue(mockInvites);

            const result = await teamInvitesService.findAllByTeam(mockTeamId);

            expect(result).toEqual(mockInvites);
            expect(findSpy).toHaveBeenCalledWith({
                where: { team: { id: mockTeamId } },
                order: { createdAt: 'DESC' },
                relations: ['inviter', 'inviter.user'],
            });
        });
    });

    describe('findById', () => {
        it('should return an invite if found', async () => {
            const mockInvite = {
                id: mockInviteId,
                team: { id: mockTeamId },
            } as TeamInvite;

            const findOneSpy = jest
                .spyOn(invitesRepository, 'findOne')
                .mockResolvedValue(mockInvite);

            const result = await teamInvitesService.findById(
                mockTeamId,
                mockInviteId,
            );

            expect(result).toEqual(mockInvite);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { team: { id: mockTeamId }, id: mockInviteId },
                relations: ['inviter', 'inviter.user'],
            });
        });

        it('should return null if invite is not found', async () => {
            jest.spyOn(invitesRepository, 'findOne').mockResolvedValue(null);

            const result = await teamInvitesService.findById(
                mockTeamId,
                mockInviteId,
            );

            expect(result).toBeNull();
        });
    });

    describe('findByEmail', () => {
        it('should return an invite by email if found', async () => {
            const mockInvite = {
                id: mockInviteId,
                email: mockEmail,
            } as TeamInvite;

            const findOneSpy = jest
                .spyOn(invitesRepository, 'findOne')
                .mockResolvedValue(mockInvite);

            const result = await teamInvitesService.findByEmail(
                mockTeamId,
                mockEmail,
            );

            expect(result).toEqual(mockInvite);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { team: { id: mockTeamId }, email: mockEmail },
                relations: ['inviter', 'inviter.user'],
            });
        });
    });

    describe('findByToken', () => {
        it('should return an invite by hashed token', async () => {
            const mockInvite = {
                email: mockEmail,
                team: { id: mockTeamId },
            } as TeamInvite;

            const findOneSpy = jest
                .spyOn(invitesRepository, 'findOne')
                .mockResolvedValue(mockInvite);

            const result = await teamInvitesService.findByToken(mockToken);

            expect(jest.spyOn(hashingService, 'hash')).toHaveBeenCalledWith(
                mockToken,
            );
            expect(result).toEqual(mockInvite);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { tokenHash: mockHash },
                select: ['email', 'expiresAt', 'team'],
                relations: ['team'],
            });
        });
    });

    describe('createInvite', () => {
        it('should create a new invite successfully', async () => {
            const createdInvite = {
                id: mockInviteId,
                email: mockEmail,
                status: InviteStatus.PENDING,
            } as TeamInvite;

            jest.spyOn(teamInvitesService, 'findByEmail').mockResolvedValue(
                null,
            );

            const createSpy = jest
                .spyOn(invitesRepository, 'create')
                .mockReturnValue(createdInvite);
            const saveSpy = jest
                .spyOn(invitesRepository, 'save')
                .mockResolvedValue(createdInvite);

            const result = await teamInvitesService.createInvite(
                mockTeamId,
                mockEmail,
                mockInviterId,
            );

            expect(result.invite).toEqual(createdInvite);
            expect(result.token).toEqual(expect.any(String));

            expect(jest.spyOn(hashingService, 'hash')).toHaveBeenCalledWith(
                result.token,
            );
            expect(
                jest.spyOn(configService, 'getOrThrow'),
            ).toHaveBeenCalledWith('INVITE_EXPIRATION_TIME');

            expect(createSpy).toHaveBeenCalledWith({
                tokenHash: mockHash,
                email: mockEmail,
                status: InviteStatus.PENDING,
                team: { id: mockTeamId },
                inviter: { id: mockInviterId },
                expiresAt: expect.any(Date) as Date,
            });

            expect(saveSpy).toHaveBeenCalledWith(createdInvite);
        });

        it('should throw ConflictException if invite already exists for email', async () => {
            jest.spyOn(teamInvitesService, 'findByEmail').mockResolvedValue({
                id: mockInviteId,
            } as TeamInvite);

            await expect(
                teamInvitesService.createInvite(
                    mockTeamId,
                    mockEmail,
                    mockInviterId,
                ),
            ).rejects.toThrow(ConflictException);
            await expect(
                teamInvitesService.createInvite(
                    mockTeamId,
                    mockEmail,
                    mockInviterId,
                ),
            ).rejects.toThrow('Invite already exists');
        });
    });

    describe('verifyInvite', () => {
        it('should successfully verify an invite', async () => {
            const mockInvite = {
                id: mockInviteId,
                email: mockEmail,
                status: InviteStatus.PENDING,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Not expired
            } as TeamInvite;

            const findOneSpy = jest
                .spyOn(invitesRepository, 'findOne')
                .mockResolvedValue(mockInvite);

            const result = await teamInvitesService.verifyInvite(
                mockEmail,
                mockToken,
            );

            expect(jest.spyOn(hashingService, 'hash')).toHaveBeenCalledWith(
                mockToken,
            );
            expect(result).toEqual(mockInvite);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: {
                    email: mockEmail,
                    tokenHash: mockHash,
                    status: InviteStatus.PENDING,
                    deletedAt: IsNull(),
                },
                relations: ['inviter', 'team'],
            });
        });

        it('should throw NotFoundException if invite is not found', async () => {
            jest.spyOn(invitesRepository, 'findOne').mockResolvedValue(null);

            await expect(
                teamInvitesService.verifyInvite(mockEmail, mockToken),
            ).rejects.toThrow(NotFoundException);
            await expect(
                teamInvitesService.verifyInvite(mockEmail, mockToken),
            ).rejects.toThrow('Invite not found');
        });

        it('should throw BadRequestException and revoke if invite is expired', async () => {
            const expiredInvite = {
                id: mockInviteId,
                email: mockEmail,
                status: InviteStatus.PENDING,
                expiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired
            } as TeamInvite;

            jest.spyOn(invitesRepository, 'findOne').mockResolvedValue(
                expiredInvite,
            );
            const revokeSpy = jest
                .spyOn(teamInvitesService, 'revokeInvite')
                .mockResolvedValue();

            await expect(
                teamInvitesService.verifyInvite(mockEmail, mockToken),
            ).rejects.toThrow(BadRequestException);
            await expect(
                teamInvitesService.verifyInvite(mockEmail, mockToken),
            ).rejects.toThrow('Invite expired');

            expect(revokeSpy).toHaveBeenCalledWith(mockInviteId);
        });
    });

    describe('updateInviteStatus', () => {
        it('should update the invite status and save', async () => {
            const invite = {
                id: mockInviteId,
                status: InviteStatus.PENDING,
            } as TeamInvite;
            const updatedInvite = {
                ...invite,
                status: InviteStatus.ACCEPTED,
            } as TeamInvite;

            const saveSpy = jest
                .spyOn(invitesRepository, 'save')
                .mockResolvedValue(updatedInvite);

            const result = await teamInvitesService.updateInviteStatus(
                invite,
                InviteStatus.ACCEPTED,
            );

            expect(result).toEqual(updatedInvite);
            expect(invite.status).toBe(InviteStatus.ACCEPTED);
            expect(saveSpy).toHaveBeenCalledWith(invite);
        });
    });

    describe('revokeInvite', () => {
        it('should soft delete and update status to REVOKED', async () => {
            const updateSpy = jest
                .spyOn(invitesRepository, 'update')
                .mockResolvedValue({
                    affected: 1,
                    raw: [],
                    generatedMaps: [],
                });

            await teamInvitesService.revokeInvite(mockInviteId);

            expect(updateSpy).toHaveBeenCalledWith(
                { id: mockInviteId },
                {
                    deletedAt: expect.any(Date) as Date,
                    status: InviteStatus.REVOKED,
                },
            );
        });
    });
});
