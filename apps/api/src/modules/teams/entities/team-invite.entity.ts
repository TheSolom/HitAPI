import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    DeleteDateColumn,
    type Relation,
    Index,
} from 'typeorm';
import { InviteStatus } from '../enums/invite-status.enum.js';
import { Team } from './team.entity.js';
import { TeamMember } from './team-member.entity.js';

@Entity()
@Index(['email', 'team'], { unique: true })
export class TeamInvite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tokenHash: string;

    @Column()
    email: string;

    @Column({ type: 'enum', enum: InviteStatus })
    status: InviteStatus;

    @ManyToOne(() => Team, (team) => team.invites, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    team: Relation<Team>;

    @ManyToOne(() => TeamMember, (teamMember) => teamMember.invites, {
        nullable: false,
    })
    inviter: Relation<TeamMember>;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
