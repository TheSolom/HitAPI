import {
    Entity,
    Index,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    type Relation,
} from 'typeorm';
import { App } from '../../apps/entities/app.entity.js';

@Entity()
@Index(['timeWindow'])
export class Resource {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: bigint;

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
    })
    cpuPercent: number | null;

    @Column({ type: 'int' })
    memoryRss: number;

    @Column({ type: 'timestamptz' })
    timeWindow: Date;

    @ManyToOne(() => App, { onDelete: 'CASCADE', nullable: false })
    app: Relation<App>;

    @CreateDateColumn()
    createdAt: Date;
}
