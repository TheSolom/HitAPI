import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    ManyToOne,
    type Relation,
} from 'typeorm';
import { Endpoint } from '../../endpoints/entities/endpoint.entity.js';
import { Consumer } from '../../consumers/entities/consumer.entity.js';

@Entity()
@Unique('TrafficMetricEndpointConsumerTimeWindow', [
    'endpoint',
    'consumer',
    'timeWindow',
])
export class TrafficMetric {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    requestCount: number;

    @Column('bigint')
    requestSizeSum: number;

    @Column('bigint')
    responseSizeSum: number;

    @Column('int')
    responseTimeP50: number;

    @Column('int')
    responseTimeP75: number;

    @Column('int')
    responseTimeP95: number;

    @Column('timestamptz')
    timeWindow: Date;

    @ManyToOne(() => Endpoint, { onDelete: 'CASCADE', nullable: false })
    endpoint: Relation<Endpoint>;

    @ManyToOne(() => Consumer, { onDelete: 'SET NULL' })
    consumer: Relation<Consumer> | null;

    @CreateDateColumn()
    createdAt: Date;
}
