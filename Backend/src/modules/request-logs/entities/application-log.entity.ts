import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    type Relation,
} from 'typeorm';
import { RequestLog } from './request-log.entity.js';

@Entity()
@Index(['requestLog', 'level'])
export class ApplicationLog {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: bigint;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    level: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    logger: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    file: string | null;

    @Column({ type: 'int', nullable: true })
    line: number | null;

    @ManyToOne(() => RequestLog, (rl) => rl.applicationLogs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'requestUuid', referencedColumnName: 'requestUuid' })
    requestLog: Relation<RequestLog>;

    @Column({ type: 'timestamptz' })
    timestamp: Date;
}
