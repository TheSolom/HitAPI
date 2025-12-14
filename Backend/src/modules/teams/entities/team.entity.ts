import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    type Relation,
} from 'typeorm';
import { TeamMember } from './team-member.entity.js';
import { TeamInvite } from './team-invite.entity.js';

@Entity()
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'boolean', default: false })
    demo: boolean;

    @Column({ type: 'boolean', default: false })
    stealth: boolean;

    @OneToMany(() => TeamMember, (teamMember) => teamMember.team, {
        cascade: true,
    })
    teamMembers: Relation<TeamMember[]>;

    @OneToMany(() => TeamInvite, (invite) => invite.team, {
        cascade: true,
    })
    invites: Relation<TeamInvite[]>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
