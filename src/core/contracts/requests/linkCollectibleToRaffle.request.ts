import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

const maxAllowed = 2147483647;

export class LinkCollectibleToRaffleRequest {
    @ApiProperty({ type: Number })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(maxAllowed)
    score?: number;
}
