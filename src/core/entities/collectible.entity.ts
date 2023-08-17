import { QuestionnaireQuestionEntity } from './questionnaireQuestion.entity';

export class CollectibleEntity {
    id?: string;
    name: string;
    description: string;
    website?: string;
    image?: CollectibleImage | null;
    attendees: number;
    eventId: string;
    submitExternal?: boolean;
    createdBy: string;
    updatedBy?: string;
    createdAt?: number;
    updatedAt?: number;
    questions?: QuestionnaireQuestionEntity[];
}

export class CollectibleImage {
    fieldname: string;
    mimetype: string;
    buffer: ArrayBufferLike;
}

export class UpdateCollectibleEntity {
    id?: string;
    name?: string;
    description?: string;
    website?: string;
    image?: CollectibleImage | string | null;
    attendees?: number;
    submitExternal?: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: number;
    updatedAt?: number;
    questions?: QuestionnaireQuestionEntity[];
}

export class GetCollectibleEntity {
    collectibleId: string;
    createdBy: string;
}

export class LinkCollectibleToRaffleEntity {
    id?: string;
    collectibleId: string;
    raffleId: string;
    score?: number;
    createdBy: string;
}
