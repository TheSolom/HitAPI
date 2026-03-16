import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { TeamMembersService } from '../team-members.service.js';
import type { ITeamMembersService } from '../interfaces/team-members-service.interfaces.js';
import { TeamMember } from '../entities/team-member.entity.js';
import { AddTeamMemberDto } from '../dto/add-team-member.dto.js';
import { TeamMemberRoles } from '../enums/team-member-roles.enum.js';

const mockTeamId = 'team-uuid-123';
const mockUserId = 'user-uuid-123';
const mockMemberId = 'member-uuid-123';

const mockTeamMembersRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
});

describe('TeamMembersService', () => {
    let teamMembersService: ITeamMembersService;
    let teamMembersRepository: Repository<TeamMember>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamMembersService,
                {
                    provide: getRepositoryToken(TeamMember),
                    useFactory: mockTeamMembersRepository,
                },
            ],
        }).compile();

        teamMembersService =
            module.get<ITeamMembersService>(TeamMembersService);
        teamMembersRepository = module.get<Repository<TeamMember>>(
            getRepositoryToken(TeamMember),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(teamMembersService).toBeDefined();
    });

    describe('findAllByTeam', () => {
        it('should return team members for a given team ordered correctly', async () => {
            const mockMembers = [
                {
                    id: '1',
                    role: TeamMemberRoles.OWNER,
                    team: { id: mockTeamId },
                    user: { id: 'user-1' },
                } as TeamMember,
                {
                    id: '2',
                    role: TeamMemberRoles.MEMBER,
                    team: { id: mockTeamId },
                    user: { id: 'user-2' },
                } as TeamMember,
            ];

            const findSpy = jest
                .spyOn(teamMembersRepository, 'find')
                .mockResolvedValue(mockMembers);

            const result = await teamMembersService.findAllByTeam(mockTeamId);

            expect(result).toEqual(mockMembers);
            expect(findSpy).toHaveBeenCalledWith({
                where: { team: { id: mockTeamId } },
                order: { joinedAt: 'ASC', user: { email: 'ASC' } },
                relations: ['user'],
            });
        });
    });

    describe('findById', () => {
        it('should return a team member if found', async () => {
            const mockMember = {
                id: mockMemberId,
                team: { id: mockTeamId },
                user: { id: mockUserId },
            } as TeamMember;

            const findOneSpy = jest
                .spyOn(teamMembersRepository, 'findOne')
                .mockResolvedValue(mockMember);

            const result = await teamMembersService.findById(
                mockTeamId,
                mockMemberId,
            );

            expect(result).toEqual(mockMember);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { team: { id: mockTeamId }, id: mockMemberId },
                relations: ['user'],
            });
        });

        it('should return null if team member is not found', async () => {
            jest.spyOn(teamMembersRepository, 'findOne').mockResolvedValue(
                null,
            );

            const result = await teamMembersService.findById(
                mockTeamId,
                mockMemberId,
            );

            expect(result).toBeNull();
        });
    });

    describe('findByUserId', () => {
        it('should return a team member by user id if found', async () => {
            const mockMember = {
                id: mockMemberId,
                team: { id: mockTeamId },
                user: { id: mockUserId },
            } as TeamMember;

            const findOneSpy = jest
                .spyOn(teamMembersRepository, 'findOne')
                .mockResolvedValue(mockMember);

            const result = await teamMembersService.findByUserId(
                mockTeamId,
                mockUserId,
            );

            expect(result).toEqual(mockMember);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { team: { id: mockTeamId }, user: { id: mockUserId } },
                relations: ['user'],
            });
        });
    });

    describe('searchTeamMembers', () => {
        it('should return matching team members by search string', async () => {
            const mockMembers = [
                {
                    id: '1',
                    user: {
                        displayName: 'John Doe',
                        email: 'john@example.com',
                    },
                },
            ] as unknown as TeamMember[];
            const searchStr = 'John';

            const findSpy = jest
                .spyOn(teamMembersRepository, 'find')
                .mockResolvedValue(mockMembers);

            const result = await teamMembersService.searchTeamMembers(
                mockTeamId,
                searchStr,
            );

            expect(result).toEqual(mockMembers);
            expect(findSpy).toHaveBeenCalledWith({
                where: [
                    {
                        team: { id: mockTeamId },
                        user: { displayName: ILike(`%${searchStr}%`) },
                    },
                    {
                        team: { id: mockTeamId },
                        user: { email: ILike(`%${searchStr}%`) },
                    },
                ],
                relations: ['user'],
            });
        });
    });

    describe('addTeamMember', () => {
        it('should successfully add a team member', async () => {
            const addTeamMemberDto: AddTeamMemberDto = {
                userId: mockUserId,
                role: TeamMemberRoles.ADMIN,
            };

            const createdMember = {
                id: mockMemberId,
                team: { id: mockTeamId },
                user: { id: mockUserId },
                role: addTeamMemberDto.role,
            } as TeamMember;

            jest.spyOn(teamMembersService, 'findByUserId').mockResolvedValue(
                null,
            );

            const createSpy = jest
                .spyOn(teamMembersRepository, 'create')
                .mockReturnValue(createdMember);
            const saveSpy = jest
                .spyOn(teamMembersRepository, 'save')
                .mockResolvedValue(createdMember);

            const result = await teamMembersService.addTeamMember(
                mockTeamId,
                addTeamMemberDto,
            );

            expect(result).toEqual(createdMember);
            expect(createSpy).toHaveBeenCalledWith({
                team: { id: mockTeamId },
                user: { id: mockUserId },
                role: addTeamMemberDto.role,
            });
            expect(saveSpy).toHaveBeenCalledWith(createdMember);
        });

        it('should throw ConflictException if user is already a member', async () => {
            const addTeamMemberDto: AddTeamMemberDto = {
                userId: mockUserId,
                role: TeamMemberRoles.ADMIN,
            };

            const existingMember = { id: mockMemberId } as TeamMember;

            jest.spyOn(teamMembersService, 'findByUserId').mockResolvedValue(
                existingMember,
            );

            await expect(
                teamMembersService.addTeamMember(mockTeamId, addTeamMemberDto),
            ).rejects.toThrow(ConflictException);
            await expect(
                teamMembersService.addTeamMember(mockTeamId, addTeamMemberDto),
            ).rejects.toThrow('Member already exists');
        });
    });

    describe('checkRolePriority', () => {
        it('should return true if updater role priority is higher (lower number) than the target role (equality=true)', () => {
            // OWNER (1) vs ADMIN (2) => 1 <= 2 => true
            expect(
                teamMembersService.checkRolePriority(
                    TeamMemberRoles.OWNER,
                    TeamMemberRoles.ADMIN,
                ),
            ).toBe(true);
        });

        it('should return true if updater role priority is equal to target role (equality=true)', () => {
            // ADMIN (2) vs ADMIN (2) => 2 <= 2 => true
            expect(
                teamMembersService.checkRolePriority(
                    TeamMemberRoles.ADMIN,
                    TeamMemberRoles.ADMIN,
                ),
            ).toBe(true);
        });

        it('should return false if updater role priority is equal to target role (equality=false)', () => {
            // ADMIN (2) vs ADMIN (2) => 2 <= (2 - 1) => 2 <= 1 => false
            expect(
                teamMembersService.checkRolePriority(
                    TeamMemberRoles.ADMIN,
                    TeamMemberRoles.ADMIN,
                    false,
                ),
            ).toBe(false);
        });

        it('should return false if updater role priority is lower (higher number) than the target role', () => {
            // MEMBER (3) vs OWNER (1) => 3 <= 1 => false
            expect(
                teamMembersService.checkRolePriority(
                    TeamMemberRoles.MEMBER,
                    TeamMemberRoles.OWNER,
                ),
            ).toBe(false);
        });
    });

    describe('updateTeamMemberRole', () => {
        it('should update the team member role and save', async () => {
            const member = {
                id: mockMemberId,
                role: TeamMemberRoles.MEMBER,
            } as TeamMember;
            const updatedMember = {
                ...member,
                role: TeamMemberRoles.ADMIN,
            } as TeamMember;

            const saveSpy = jest
                .spyOn(teamMembersRepository, 'save')
                .mockResolvedValue(updatedMember);

            const result = await teamMembersService.updateTeamMemberRole(
                member,
                TeamMemberRoles.ADMIN,
            );

            expect(result).toEqual(updatedMember);
            expect(member.role).toBe(TeamMemberRoles.ADMIN);
            expect(saveSpy).toHaveBeenCalledWith(member);
        });
    });

    describe('removeTeamMember', () => {
        it('should soft delete the team member', async () => {
            const softDeleteSpy = jest
                .spyOn(teamMembersRepository, 'softDelete')
                .mockResolvedValue({
                    affected: 1,
                    raw: [],
                    generatedMaps: [],
                });

            await teamMembersService.removeTeamMember(mockTeamId, mockMemberId);

            expect(softDeleteSpy).toHaveBeenCalledWith({
                team: { id: mockTeamId },
                id: mockMemberId,
            });
        });
    });
});
