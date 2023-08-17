import { ApiProperty } from '@nestjs/swagger';

export class RaffleResponse {
    @ApiProperty({ type: String })
    beneficiary: string;

    @ApiProperty({ type: Number })
    ticketNumber: number;
}
