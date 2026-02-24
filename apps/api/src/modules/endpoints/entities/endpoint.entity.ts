import {
    Entity,
    Unique,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    type Relation,
} from 'typeorm';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import { App } from '../../apps/entities/app.entity.js';

@Entity()
@Unique('AppEndpointMethodPath', ['app', 'method', 'path'])
export class Endpoint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ enum: RestfulMethods })
    method: RestfulMethods;

    @Column()
    path: string;

    @Column({ type: 'varchar', nullable: true })
    summary: string | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'int', nullable: true })
    targetResponseTimeMs: number | null;

    @Column({ type: 'boolean', default: false })
    excluded: boolean;

    @Column({ type: 'int', array: true, default: [] })
    expectedStatusCodes: number[];

    @ManyToOne(() => App, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    app: Relation<App>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
