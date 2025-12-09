import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { TeamsService } from '../teams.service.js';
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

describe('TeamsService', () => {
    let teamsService: TeamsService;
    let teamRepository: Repository<Team>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamsService,
                {
                    provide: getRepositoryToken(Team),
                    useFactory: mockTeamRepository,
                },
            ],
        }).compile();

        teamsService = module.get<TeamsService>(TeamsService);
        teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(teamsService).toBeDefined();
    });

    describe('findAll', () => {
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

            jest.spyOn(teamRepository, 'find').mockResolvedValue(mockTeams);

            const result = await teamsService.findAll(mockUserId);

            expect(result).toEqual(mockTeams);
            expect(teamRepository.find).toHaveBeenCalledWith({
                where: { teamMembers: { user: { id: mockUserId } } },
                order: { createdAt: 'DESC' },
            });
        });

        it('should handle empty results', async () => {
            const mockTeams = [] as Team[];

            jest.spyOn(teamRepository, 'find').mockResolvedValue(mockTeams);

            const result = await teamsService.findAll(mockUserId);

            expect(result).toEqual([]);
        });

        it('should order teams by createdAt descending', async () => {
            jest.spyOn(teamRepository, 'find').mockResolvedValue([]);

            await teamsService.findAll(mockUserId);

            expect(teamRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: { createdAt: 'DESC' },
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

            jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);

            const result = await teamsService.findOne('1');

            expect(result).toEqual(mockTeam);
            expect(teamRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
                relations: ['teamMembers', 'teamMembers.user'],
            });
        });

        it('should return null if team not found', async () => {
            jest.spyOn(teamRepository, 'findOne').mockResolvedValue(null);

            const result = await teamsService.findOne('non-existent-id');

            expect(result).toBeNull();
            expect(teamRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'non-existent-id' },
                relations: ['teamMembers', 'teamMembers.user'],
            });
        });

        it('should load teamMembers and user relations', async () => {
            jest.spyOn(teamRepository, 'findOne').mockResolvedValue({} as Team);

            await teamsService.findOne('1');

            expect(teamRepository.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    relations: ['teamMembers', 'teamMembers.user'],
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

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(null);
            jest.spyOn(teamRepository, 'create').mockReturnValue(createdTeam);
            jest.spyOn(teamRepository, 'save').mockResolvedValue(createdTeam);

            const result = await teamsService.createTeam(
                mockUserId,
                createTeamDto,
            );

            expect(result).toEqual(createdTeam);
            expect(teamRepository.findOneBy).toHaveBeenCalled();
            expect(teamRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createTeamDto.name,
                    demo: createTeamDto.demo,
                    stealth: createTeamDto.stealth,
                    slug: expect.any(String),
                }),
            );
            expect(teamRepository.save).toHaveBeenCalled();
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

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(
                existingTeam,
            );

            await expect(
                teamsService.createTeam(mockUserId, createTeamDto),
            ).rejects.toThrow(ConflictException);
            await expect(
                teamsService.createTeam(mockUserId, createTeamDto),
            ).rejects.toThrow('Team already exists');

            expect(teamRepository.findOneBy).toHaveBeenCalled();
            expect(teamRepository.create).not.toHaveBeenCalled();
            expect(teamRepository.save).not.toHaveBeenCalled();
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
            const updatedTeam = {
                id: '1',
                name: updateTeamDto.name,
                slug: 'updated-team',
                demo: updateTeamDto.demo,
            } as Team;

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(
                existingTeam,
            );
            jest.spyOn(teamRepository, 'merge').mockReturnValue(updatedTeam);
            jest.spyOn(teamRepository, 'save').mockResolvedValue(updatedTeam);

            const result = await teamsService.updateTeam('1', updateTeamDto);

            expect(result).toEqual(updatedTeam);
            expect(teamRepository.merge).toHaveBeenCalledWith(
                existingTeam,
                expect.objectContaining({
                    name: updateTeamDto.name,
                    demo: updateTeamDto.demo,
                    slug: expect.any(String),
                }),
            );
            expect(teamRepository.save).toHaveBeenCalledWith(updatedTeam);
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
            const updatedTeam = {
                id: '1',
                name: 'Team',
                slug: 'team',
                demo: updateTeamDto.demo,
                stealth: updateTeamDto.stealth,
            } as Team;

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(
                existingTeam,
            );
            jest.spyOn(teamRepository, 'merge').mockReturnValue(updatedTeam);
            jest.spyOn(teamRepository, 'save').mockResolvedValue(updatedTeam);

            const result = await teamsService.updateTeam('1', updateTeamDto);

            expect(result).toEqual(updatedTeam);
            expect(teamRepository.merge).toHaveBeenCalledWith(
                existingTeam,
                updateTeamDto,
            );
            expect(teamRepository.save).toHaveBeenCalledWith(updatedTeam);
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

        it('should handle partial updates correctly', async () => {
            const existingTeam = {
                id: '1',
                name: 'Team',
                slug: 'team',
                stealth: false,
            } as Team;
            const updateTeamDto: UpdateTeamDto = {
                stealth: true,
            };
            const updatedTeam = { id: '1', stealth: true } as Team;

            jest.spyOn(teamRepository, 'findOneBy').mockResolvedValue(
                existingTeam,
            );
            jest.spyOn(teamRepository, 'merge').mockReturnValue(updatedTeam);
            jest.spyOn(teamRepository, 'save').mockResolvedValue(updatedTeam);

            await teamsService.updateTeam('1', updateTeamDto);

            expect(teamRepository.merge).toHaveBeenCalledWith(
                existingTeam,
                updateTeamDto,
            );
        });
    });

    describe('deleteTeam', () => {
        it('should call softDelete with correct id', async () => {
            const softDeleteSpy = jest
                .spyOn(teamRepository, 'softDelete')
                .mockResolvedValue({
                    affected: 1,
                    raw: [],
                    generatedMaps: [],
                });

            await teamsService.deleteTeam('1');

            expect(softDeleteSpy).toHaveBeenCalledWith('1');
        });

        it('should handle deleting non-existent team', async () => {
            jest.spyOn(teamRepository, 'softDelete').mockResolvedValue({
                affected: 0,
                raw: [],
                generatedMaps: [],
            });

            await expect(
                teamsService.deleteTeam('non-existent-id'),
            ).resolves.not.toThrow();
        });
    });
});
