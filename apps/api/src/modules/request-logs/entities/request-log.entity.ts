import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    ManyToOne,
    type Relation,
} from 'typeorm';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import { Consumer } from '../../consumers/entities/consumer.entity.js';
import { App } from '../../apps/entities/app.entity.js';

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

    @Column({ type: 'float8' })
    responseTime: number;

    @Column({ type: 'int', nullable: true })
    requestSize: number | null;

    @Column({ type: 'jsonb', default: [] })
    requestHeaders: [string, string][];

    @Column({ type: 'bytea', nullable: true })
    requestBody: Buffer | null;

    @Column({ type: 'int', nullable: true })
    responseSize: number | null;

    @Column({ type: 'jsonb', default: [] })
    responseHeaders: [string, string][];

    @Column({ type: 'bytea', nullable: true })
    responseBody: Buffer | null;

    @Column({ type: 'inet', nullable: true })
    clientIp: string | null;

    @Column({ type: 'varchar', length: 2, nullable: true })
    clientCountryCode: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    exceptionType: string | null;

    @Column({ type: 'text', nullable: true })
    exceptionMessage: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    traceId: string | null;

    @Column({ type: 'text', nullable: true })
    exceptionStacktrace: string | null;

    @ManyToOne(() => Consumer, { onDelete: 'SET NULL' })
    consumer: Relation<Consumer> | null;

    @ManyToOne(() => App, { onDelete: 'CASCADE', nullable: false })
    app: Relation<App>;

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
