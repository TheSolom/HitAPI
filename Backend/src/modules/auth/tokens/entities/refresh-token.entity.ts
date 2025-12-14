import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity.js';

@Entity('refresh_tokens')
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
}
