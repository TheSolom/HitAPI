import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    @IsNotEmpty()
    demo: boolean;

    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    @IsNotEmpty()
    stealth: boolean;
}
