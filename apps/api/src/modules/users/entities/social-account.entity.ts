import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    type Relation,
} from 'typeorm';
import { AuthProvidersEnum } from '../../auth/enums/auth-providers.enum.js';
import { User } from './user.entity.js';

@Entity()
@Unique('SocialAccountProviderSocialId', ['provider', 'socialId'])
export class SocialAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: AuthProvidersEnum })
    provider: AuthProvidersEnum;

    @Column()
    socialId: string;

    @ManyToOne(() => User, (user) => user.socialAccounts, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    user: Relation<User>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
