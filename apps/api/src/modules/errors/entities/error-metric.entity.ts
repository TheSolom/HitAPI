import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    type Relation,
} from 'typeorm';
import { App } from '../../apps/entities/app.entity.js';

@Entity()
export class ErrorMetric {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    clientErrorCount: number;

    @Column('int')
    serverErrorCount: number;

    @Column('timestamptz')
    timeWindow: Date;

    @ManyToOne(() => App, { onDelete: 'CASCADE', nullable: false })
    app: Relation<App>;

    @CreateDateColumn()
    createdAt: Date;
}
