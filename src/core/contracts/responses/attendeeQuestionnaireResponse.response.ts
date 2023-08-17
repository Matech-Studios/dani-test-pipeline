import { ApiProperty } from '@nestjs/swagger';

export class AttendeeQuestionnaireResponse {
    @ApiProperty({ type: String })
    beneficiary: string;

    @ApiProperty({ type: Number })
    ticketNumber: number;

    @ApiProperty({ type: String })
    eventId: string;
}
