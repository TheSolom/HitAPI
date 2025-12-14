import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity()
export class Framework {
    @Expose()
    @ApiProperty({ type: 'number' })
    @PrimaryGeneratedColumn()
    id: number;

    @Expose()
    @ApiProperty({ type: 'string' })
    @Column()
    name: string;
}
