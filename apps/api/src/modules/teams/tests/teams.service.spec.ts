/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Services } from '../../../common/constants/services.constant.js';
import { TeamsService } from '../teams.service.js';
import type { ITeamsService } from '../interfaces/teams-service.interfaces.js';
import type { ITeamMembersService } from '../interfaces/team-members-service.interfaces.js';
import { Team } from '../entities/team.entity.js';
import { CreateTeamDto } from '../dto/create-team.dto.js';
import { UpdateTeamDto } from '../dto/update-team.dto.js';

const mockUserId = 'user-uuid-123';

const mockTeamRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    merge: jest.fn(),
});

const mockTeamMembersService = (): jest.Mocked<ITeamMembersService> => ({
    findAllByTeam: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    searchTeamMembers: jest.fn(),
    addTeamMember: jest.fn(),
    checkRolePriority: jest.fn(),
    updateTeamMemberRole: jest.fn(),
    removeTeamMember: jest.fn(),
    removeAllByTeam: jest.fn(),
});

describe('TeamsService', () => {
    let teamsService: ITeamsService;
    let teamRepository: Repository<Team>;
    let teamMembersService: jest.Mocked<ITeamMembersService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamsService,
                {
                    provide: getRepositoryToken(Team),
                    useFactory: mockTeamRepository,
                },
                {
                    provide: Services.TEAM_MEMBERS,
                    useFactory: mockTeamMembersService,
                },
            ],
        }).compile();

        teamsService = module.get<ITeamsService>(TeamsService);
        teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
        teamMembersService = module.get(Services.TEAM_MEMBERS);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(teamsService).toBeDefined();
    });

    describe('findAllByUser', () => {
        it('should return teams for the given user', async () => {
            const mockTeams = [
                {
                    id: '1',
                    name: 'Team 1',
                    slug: 'team-1',
                    demo: false,
                    stealth: false,
                } as Team,
                {
                    id: '2',
                    name: 'Team 2',
                    slug: 'team-2',
                    demo: false,
                    stealth: false,
                } as Team,
            ];

            const findSpy = jest
                .spyOn(teamRepository, 'find')
                .mockResolvedValue(mockTeams);

            const result = await teamsService.findAllByUser(mockUserId);

            expect(result).toEqual(mockTeams);
            expect(findSpy).toHaveBeenCalledWith({
                where: { teamMembers: { user: { id: mockUserId } } },
                order: { createdAt: 'DESC' },
                relations: [
                    'teamMembers',
                    'teamMembers.user',
                    'invites',
                    'invites.inviter',
                ],
            });
        });

        it('should auto-provision a default Personal team when user has no teams', async () => {
            const defaultTeam = {
                id: 'default-team-uuid',
                name: 'Personal',
                slug: 'personal',
                demo: false,
                stealth: false,
            } as Team;

            jest.spyOn(teamRepository, 'find').mockResolvedValue([]);
            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(null);
            jest.spyOn(teamRepository, 'create').mockReturnValue(defaultTeam);
            jest.spyOn(teamRepository, 'save').mockResolvedValue(defaultTeam);
            jest.spyOn(teamRepository, 'findOne').mockResolvedValue(
                defaultTeam,
            );

            const result = await teamsService.findAllByUser(mockUserId);

            expect(result).toEqual([defaultTeam]);
            expect(teamRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Personal',
                    slug: 'personal',
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return a team if found with relations', async () => {
            const mockTeam = {
                id: '1',
                name: 'Team 1',
                slug: 'team-1',
                demo: false,
                stealth: false,
                teamMembers: [
                    {
                        id: '1',
                        user: { id: 'user-1', email: 'user@example.com' },
                    },
                ],
            } as Team;

            const findOneSpy = jest
                .spyOn(teamRepository, 'findOne')
                .mockResolvedValue(mockTeam);

            const result = await teamsService.findOne('1');

            expect(result).toEqual(mockTeam);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { id: '1' },
                relations: [
                    'teamMembers',
                    'teamMembers.user',
                    'invites',
                    'invites.inviter',
                ],
            });
        });

        it('should return null if team not found', async () => {
            const findOneSpy = jest
                .spyOn(teamRepository, 'findOne')
                .mockResolvedValue(null);

            const result = await teamsService.findOne('non-existent-id');

            expect(result).toBeNull();
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { id: 'non-existent-id' },
                relations: [
                    'teamMembers',
                    'teamMembers.user',
                    'invites',
                    'invites.inviter',
                ],
            });
        });

        it('should load teamMembers and user relations', async () => {
            const findOneSpy = jest
                .spyOn(teamRepository, 'findOne')
                .mockResolvedValue({} as Team);

            await teamsService.findOne('1');

            expect(findOneSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    relations: [
                        'teamMembers',
                        'teamMembers.user',
                        'invites',
                        'invites.inviter',
                    ],
                }),
            );
        });
    });

    describe('createTeam', () => {
        it('should create a team with generated slug', async () => {
            const createTeamDto: CreateTeamDto = {
                name: 'New Team',
                demo: false,
                stealth: false,
            };
            const createdTeam = {
                id: '1',
                name: createTeamDto.name,
                slug: 'new-team',
                demo: createTeamDto.demo,
                stealth: createTeamDto.stealth,
            } as Team;

            const findOneBySpy = jest
                .spyOn(teamRepository, 'findOneBy')
                .mockResolvedValue(null);
            const createSpy = jest
                .spyOn(teamRepository, 'create')
                .mockReturnValue(createdTeam);
            const saveSpy = jest
                .spyOn(teamRepository, 'save')
                .mockResolvedValue(createdTeam);

            const result = await teamsService.createTeam(
                mockUserId,
                createTeamDto,
            );

            expect(result).toEqual(createdTeam);
            expect(findOneBySpy).toHaveBeenCalled();
            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createTeamDto.name,
                    demo: createTeamDto.demo,
                    stealth: createTeamDto.stealth,
                    slug: expect.any(String) as string,
                }),
            );
            expect(saveSpy).toHaveBeenCalled();
        });

        it('should throw ConflictException if slug already exists', async () => {
            const createTeamDto: CreateTeamDto = {
                name: 'Existing Team',
                demo: false,
                stealth: false,
            };
            const existingTeam = {
                id: '1',
                name: 'Existing Team',
                slug: 'existing-team',
            } as Team;

            const findOneBySpy = jest
                .spyOn(teamRepository, 'findOneBy')
                .mockResolvedValue(existingTeam);
            const createSpy = jest.spyOn(teamRepository, 'create');
            const saveSpy = jest.spyOn(teamRepository, 'save');

            await expect(
                teamsService.createTeam(mockUserId, createTeamDto),
            ).rejects.toThrow(ConflictException);
            await expect(
                teamsService.createTeam(mockUserId, createTeamDto),
            ).rejects.toThrow('Team already exists');

            expect(findOneBySpy).toHaveBeenCalled();
            expect(createSpy).not.toHaveBeenCalled();
            expect(saveSpy).not.toHaveBeenCalled();
        });

        it('should save the created team', async () => {
            const createTeamDto: CreateTeamDto = {
                name: 'Team',
                demo: true,
                stealth: true,
            };
            const createdTeam = { id: '1', slug: 'team' } as Team;

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(null);
            jest.spyOn(teamRepository, 'create').mockReturnValue(createdTeam);
            const saveSpy = jest
                .spyOn(teamRepository, 'save')
                .mockResolvedValue(createdTeam);

            await teamsService.createTeam(mockUserId, createTeamDto);

            expect(saveSpy).toHaveBeenCalledWith(createdTeam);
        });
    });

    describe('updateTeam', () => {
        it('should update team with new slug when name changes', async () => {
            const existingTeam = {
                id: '1',
                name: 'Old Team',
                slug: 'old-team',
                demo: false,
            } as Team;
            const updateTeamDto: UpdateTeamDto = {
                name: 'Updated Team',
                demo: true,
            };
            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(
                existingTeam,
            );
            const saveSpy = jest
                .spyOn(teamRepository, 'save')
                .mockImplementation((team) => Promise.resolve(team as Team));

            const result = await teamsService.updateTeam('1', updateTeamDto);

            expect(result.name).toBe('Updated Team');
            expect(result.slug).toBe('updated-team');
            expect(result.demo).toBe(true);
            expect(saveSpy).toHaveBeenCalledWith(existingTeam);
        });

        it('should update team without slug when name does not change', async () => {
            const existingTeam = {
                id: '1',
                name: 'Team',
                slug: 'team',
                demo: false,
                stealth: true,
            } as Team;
            const updateTeamDto: UpdateTeamDto = {
                demo: true,
                stealth: false,
            };

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(
                existingTeam,
            );
            const saveSpy = jest
                .spyOn(teamRepository, 'save')
                .mockImplementation((team) => Promise.resolve(team as Team));

            const result = await teamsService.updateTeam('1', updateTeamDto);

            expect(result.demo).toBe(true);
            expect(result.stealth).toBe(false);
            expect(result.slug).toBe('team');
            expect(saveSpy).toHaveBeenCalledWith(existingTeam);
        });

        it('should throw NotFoundException if team not found', async () => {
            const updateTeamDto: UpdateTeamDto = {
                demo: false,
            };

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(null);

            await expect(
                teamsService.updateTeam('non-existent-id', updateTeamDto),
            ).rejects.toThrow('Team not found');
        });

        it('should update stealth option', async () => {
            const existingTeam = {
                id: '1',
                name: 'Team',
                slug: 'team',
                demo: false,
                stealth: false,
            } as Team;
            const updateTeamDto: UpdateTeamDto = {
                stealth: true,
            };

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(
                existingTeam,
            );
            const saveSpy = jest
                .spyOn(teamRepository, 'save')
                .mockImplementation((team) => Promise.resolve(team as Team));

            const result = await teamsService.updateTeam('1', updateTeamDto);

            expect(result.stealth).toBe(true);
            expect(saveSpy).toHaveBeenCalledWith(existingTeam);
        });
    });

    describe('deleteTeam', () => {
        it('should throw NotFoundException when team does not exist', async () => {
            jest.spyOn(teamRepository, 'findOne').mockResolvedValue(null);

            await expect(
                teamsService.deleteTeam(mockUserId, 'non-existent-id'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when user only has 1 team', async () => {
            const mockTeam = {
                id: 'team-1',
                name: 'Team 1',
            } as unknown as Team;

            jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);
            jest.spyOn(teamRepository, 'find').mockResolvedValue([mockTeam]);

            await expect(
                teamsService.deleteTeam(mockUserId, 'team-1'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should soft delete team and team members when user has other teams', async () => {
            const teamToDelete = {
                id: 'team-1',
                name: 'Team 1',
            } as unknown as Team;

            const otherTeam = {
                id: 'team-2',
                name: 'Team 2',
            } as unknown as Team;

            jest.spyOn(teamRepository, 'findOne').mockResolvedValue(
                teamToDelete,
            );
            jest.spyOn(teamRepository, 'find').mockResolvedValue([
                teamToDelete,
                otherTeam,
            ]);
            teamMembersService.removeAllByTeam.mockResolvedValue();
            const teamSoftDeleteSpy = jest
                .spyOn(teamRepository, 'softDelete')
                .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

            await teamsService.deleteTeam(mockUserId, 'team-1');

            expect(teamMembersService.removeAllByTeam).toHaveBeenCalledWith(
                'team-1',
            );
            expect(teamSoftDeleteSpy).toHaveBeenCalledWith('team-1');
        });
    });
});
