import { QuestionnaireQuestionEntity } from './questionnaireQuestion.entity';

export class QuestionnaireEntity {
    collectibleId: string;
    questions: QuestionnaireQuestionEntity[];
    createdByExternalId: string;
}
