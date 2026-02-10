import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    OneToMany,
    type Relation,
} from 'typeorm';
import { App } from '../../apps/entities/app.entity.js';
import { Consumer } from './consumer.entity.js';

@Entity()
@Unique('AppConsumerGroupName', ['app', 'name'])
export class ConsumerGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => App, { onDelete: 'CASCADE', nullable: false })
    app: Relation<App>;

    @OneToMany(() => Consumer, (consumer) => consumer.group, {
        cascade: true,
    })
    consumers: Relation<Consumer>[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
