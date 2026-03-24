import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    type Relation,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';
import { Framework } from './framework.entity.js';
import { Endpoint } from '../../endpoints/entities/endpoint.entity.js';

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

    @ManyToOne(() => Framework, { onDelete: 'CASCADE', nullable: false })
    framework: Relation<Framework>;

    @ManyToOne(() => Team, (team) => team.apps, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    team: Relation<Team>;

    @OneToMany(() => Endpoint, (endpoint) => endpoint.app, { cascade: true })
    endpoints: Relation<Endpoint[]>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
