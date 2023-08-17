import { ApiProperty } from '@nestjs/swagger';

export class EventRafflesPrizesResponse {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: Number })
    order: number;

    @ApiProperty({ type: String })
    details: string;

    @ApiProperty({ type: Number })
    quantity: number;
}

export class EventRafflesWinnersResponse {
    @ApiProperty({ type: String })
    beneficiary: string;
}

export class EventRafflesResponse {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: Boolean })
    useWeight: boolean;

    @ApiProperty({ type: Number })
    key: number;

    @ApiProperty({ type: String })
    status: string;

    @ApiProperty({ type: [EventRafflesPrizesResponse] })
    prizes: EventRafflesPrizesResponse[];

    @ApiProperty({ type: [EventRafflesWinnersResponse], nullable: true })
    winners?: EventRafflesWinnersResponse[];
}
