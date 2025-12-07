import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    type Relation,
} from 'typeorm';
import { TeamMemberRoles } from '../enums/team-member-roles.enum.js';
import { Team } from './team.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: TeamMemberRoles,
        default: TeamMemberRoles.MEMBER,
    })
    role: TeamMemberRoles;

    @ManyToOne(() => Team, (team) => team.teamMembers, {
        onDelete: 'CASCADE',
    })
    team: Relation<Team>;

    @ManyToOne(() => User, (user) => user.teamMembers, {
        onDelete: 'CASCADE',
    })
    user: Relation<User>;

    @CreateDateColumn()
    joinedAt: Date;
}
