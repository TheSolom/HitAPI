import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenExchangeDto {
    @ApiProperty({ type: 'string', example: 'authorization_code' })
    @IsString()
    @IsNotEmpty()
    grant_type: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    client_id: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    client_secret: string;

    @ApiProperty({ format: 'uri' })
    @IsString()
    @IsNotEmpty()
    redirect_uri: string;
}
