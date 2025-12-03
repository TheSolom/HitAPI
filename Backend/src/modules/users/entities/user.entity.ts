import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    AfterLoad,
    BeforeUpdate,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SocialAccount } from './social-account.entity.js';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    displayName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, select: false })
    @Exclude({ toPlainOnly: true })
    password?: string;

    @Exclude({ toPlainOnly: true })
    previousPassword?: string;

    @Column({ type: 'boolean', default: false })
    private verified: boolean;

    @Column({ type: 'boolean', default: false })
    private admin: boolean;

    @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user, {
        cascade: true,
    })
    socialAccounts: Relation<SocialAccount>[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @AfterLoad()
    private loadPreviousPassword(): void {
        this.previousPassword = this.password;
    }

    @BeforeUpdate()
    private updatePreviousPassword(): void {
        if (this.password !== this.previousPassword) {
            this.previousPassword = this.password;
        }
    }

    public hasPassword(): boolean {
        return !!this.password;
    }

    get isVerified(): boolean {
        return this.verified;
    }

    set isVerified(value: boolean) {
        this.verified = value;
    }

    get isAdmin(): boolean {
        return this.admin;
    }
}
