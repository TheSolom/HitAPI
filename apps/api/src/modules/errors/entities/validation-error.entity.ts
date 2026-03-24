import {
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
} from 'typeorm';
import { Endpoint } from '../../endpoints/entities/endpoint.entity.js';
import { Consumer } from '../../consumers/entities/consumer.entity.js';

@Entity()
@Index(['endpoint', 'type', 'msg'])
export class ValidationError {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: bigint;

    @Column({ type: 'text' })
    msg: string;

    @Column({ type: 'varchar', length: 255 })
    type: string;

    @Column({ type: 'jsonb' })
    loc: string[];

    @Column({ type: 'int', default: 1 })
    errorCount: number;

    @Column({ type: 'timestamptz' })
    timestamp: Date;

    @ManyToOne(() => Endpoint, (endpoint) => endpoint.validationErrors, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    endpoint: Relation<Endpoint>;

    @ManyToOne(() => Consumer, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    consumer: Relation<Consumer>;
}
