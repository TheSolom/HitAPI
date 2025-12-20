import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    type Relation,
} from 'typeorm';
import { App } from '../../apps/entities/app.entity.js';

@Entity()
@Unique(['app', 'method', 'path'])
export class Endpoint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    method: string;

    @Column()
    path: string;

    @Column({ type: 'varchar', nullable: true })
    summary: string | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'integer', nullable: true })
    targetResponseTimeMs: number | null;

    @Column({ type: 'boolean', default: false })
    excluded: boolean;

    @ManyToOne(() => App, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    app: Relation<App>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
