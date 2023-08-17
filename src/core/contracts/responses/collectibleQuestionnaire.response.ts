import { ApiProperty } from '@nestjs/swagger';

export class CollectibleAnswerResponse {
    @ApiProperty({ type: Number })
    answerKey: number;

    @ApiProperty({ type: String })
    answerText: string;

    @ApiProperty({ type: String })
    createdBy?: string;
}

export class CollectibleQuestionResponse {
    @ApiProperty({ type: Number })
    key: number;

    @ApiProperty({ type: String })
    type: string;

    @ApiProperty({ type: String })
    questionText: string;

    @ApiProperty({ type: [CollectibleAnswerResponse] })
    answers?: CollectibleAnswerResponse[];

    @ApiProperty({ type: Boolean })
    isOptional: boolean;
}

export class CollectibleQuestionnaireResponse {
    @ApiProperty({ type: String })
    title: string;

    @ApiProperty({ type: String })
    description: string;

    @ApiProperty({ type: String })
    logoUrl: string;

    @ApiProperty({ type: Number })
    eventStartDate: number;

    @ApiProperty({ type: CollectibleQuestionResponse })
    fields: CollectibleQuestionResponse[];

    constructor(data: Partial<CollectibleQuestionnaireResponse>) {
        Object.assign(this, data);
        this.eventStartDate = data.eventStartDate ? Number(data.eventStartDate) : null;
    }
}
