import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    type Relation,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';
import { Framework } from './framework.entity.js';

@Entity()
export class App {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ unique: true })
    clientId: string;

    @Column({ default: 500 })
    targetResponseTimeMs: number;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @ManyToOne(() => Framework, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    framework: Relation<Framework>;

    @ManyToOne(() => Team, (team: Team) => team.apps, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    team: Relation<Team>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
