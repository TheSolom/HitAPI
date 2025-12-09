import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    DeleteDateColumn,
    Index,
    type Relation,
} from 'typeorm';
import { TeamMemberRoles } from '../enums/team-member-roles.enum.js';
import { Team } from './team.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity()
@Index(['team', 'user'], { unique: true })
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
        nullable: false,
    })
    team: Relation<Team>;

    @ManyToOne(() => User, (user) => user.teamMembers, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    user: Relation<User>;

    @CreateDateColumn()
    joinedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
