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
import { ConsumerGroup } from './consumer-group.entity.js';

@Entity('consumers')
@Unique(['app', 'identifier'])
export class Consumer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    identifier: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name: string | null;

    @Column({ default: false })
    hidden: boolean = false;

    @ManyToOne(() => App, { onDelete: 'CASCADE', nullable: false })
    app: Relation<App>;

    @ManyToOne(() => ConsumerGroup, (group) => group.consumers, {
        onDelete: 'SET NULL',
    })
    group: Relation<ConsumerGroup> | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
