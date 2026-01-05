import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    ManyToOne,
    OneToMany,
    type Relation,
} from 'typeorm';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import { Consumer } from '../../consumers/entities/consumer.entity.js';
import { App } from '../../apps/entities/app.entity.js';
import { ApplicationLog } from './application-log.entity.js';

@Entity()
@Index(['method', 'statusCode'])
@Index(['consumer'])
@Index(['app', 'timestamp'])
export class RequestLog {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: bigint;

    @Column({ type: 'uuid', unique: true })
    requestUuid: string;

    @Column({ enum: RestfulMethods })
    method: RestfulMethods;

    @Column({ type: 'text' })
    path: string;

    @Column({ type: 'text' })
    url: string;

    @Column({ type: 'int' })
    statusCode: number;

    @Column({ type: 'varchar', length: 50 })
    statusText: string;

    @Column({ type: 'int' })
    responseTime: number;

    @Column({ type: 'int' })
    requestSize: number;

    @Column({ type: 'int' })
    responseSize: number;

    @Column({ type: 'jsonb' })
    requestHeaders: Record<string, string>;

    @Column({ type: 'text' })
    requestBody: string;

    @Column({ type: 'jsonb' })
    responseHeaders: Record<string, string>;

    @Column({ type: 'text' })
    responseBody: string;

    @Column({ type: 'inet' })
    clientIp: string;

    @Column({ type: 'varchar', length: 2 })
    clientCountryCode: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    exceptionType: string | null;

    @Column({ type: 'text', nullable: true })
    exceptionMessage: string | null;

    @Column({ type: 'text', nullable: true })
    exceptionStacktrace: string | null;

    @ManyToOne(() => Consumer, { onDelete: 'CASCADE', nullable: false })
    consumer: Relation<Consumer>;

    @ManyToOne(() => App, { onDelete: 'CASCADE', nullable: false })
    app: Relation<App>;

    @OneToMany(() => ApplicationLog, (al) => al.requestLog, { cascade: true })
    applicationLogs: Relation<ApplicationLog>[];

    @Column({ type: 'timestamptz' })
    timestamp: Date;

    isError(): boolean {
        return this.statusCode >= 400;
    }

    isServerError(): boolean {
        return this.statusCode >= 500;
    }

    isClientError(): boolean {
        return this.statusCode >= 400 && this.statusCode < 500;
    }
}
