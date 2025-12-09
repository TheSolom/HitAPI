import {
    Entity,
    Index,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity.js';

@Entity('refresh_tokens')
@Index(['user', 'deletedAt'])
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tokenHash: string;

    @ManyToOne(() => User, {
        eager: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
    user: User;

    @Column({ type: 'boolean', default: false })
    isRevoked: boolean;

    @Column({ nullable: true })
    deviceInfo?: string;

    @Column({ type: 'inet', nullable: true })
    ipAddress?: string;

    @Column({ type: 'timestamp', nullable: true })
    lastUsedAt?: Date;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
