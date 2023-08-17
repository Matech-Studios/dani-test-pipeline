import { ApiProperty } from '@nestjs/swagger';

export class PublicEventResponse {
    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: String })
    description: string;

    @ApiProperty({ type: Number })
    startDate: number;

    @ApiProperty({ type: Number })
    endDate: number;

    @ApiProperty({ type: String })
    location: string;

    constructor(data: Partial<PublicEventResponse>) {
        Object.assign(this, data);
        this.startDate = Number(data.startDate);
        this.endDate = Number(data.endDate);
    }
}
