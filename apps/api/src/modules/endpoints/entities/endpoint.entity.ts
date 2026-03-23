import {
    Entity,
    Unique,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    type Relation,
} from 'typeorm';
import { RestfulMethod } from '@hitapi/shared/enums';
import { App } from '../../apps/entities/app.entity.js';
import { ValidationError } from '../../errors/entities/validation-error.entity.js';
import { ServerError } from '../../errors/entities/server-error.entity.js';

@Entity()
@Unique('AppEndpointMethodPath', ['app', 'method', 'path'])
export class Endpoint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ enum: RestfulMethod })
    method: RestfulMethod;

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

    @ManyToOne(() => App, { onDelete: 'CASCADE', nullable: false })
    app: Relation<App>;

    @OneToMany(
        () => ValidationError,
        (validationError) => validationError.endpoint,
        { cascade: true },
    )
    validationErrors: Relation<ValidationError[]>;

    @OneToMany(() => ServerError, (serverError) => serverError.endpoint, {
        cascade: true,
    })
    serverErrors: Relation<ServerError[]>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
