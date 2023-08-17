import { EventDto } from 'src/core/dto/event.dto';
import { QuestionnaireQuestionDto } from 'src/core/dto/questionnaireQuestion.dto';

export class UpsertCollectibleResponse {
    id: string;
    name: string;
    description?: string;
    website?: string;
    image?: string;
    attendees?: number;
    externalPoapId?: number;
    event?: EventDto;
    questions?: QuestionnaireQuestionDto[];
    externalPoapError?: string;
}
