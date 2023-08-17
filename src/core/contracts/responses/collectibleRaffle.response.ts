import { ApiProperty } from '@nestjs/swagger';

export class AvailableRaffleResponse {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: Boolean })
    useWeight: boolean;
}

export class LinkedRaffleResponse {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: Number })
    score: number;

    @ApiProperty({ type: AvailableRaffleResponse })
    raffle: AvailableRaffleResponse;
}

export class CollectibleRaffleResponse {
    @ApiProperty({ type: [LinkedRaffleResponse] })
    linked: LinkedRaffleResponse[];

    @ApiProperty({ type: [AvailableRaffleResponse] })
    available: AvailableRaffleResponse[];
}
