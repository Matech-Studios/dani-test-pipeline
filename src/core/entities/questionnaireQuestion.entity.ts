import { QuestionnaireAnswerEntity } from './questionnaireAnswer.entity';

export class QuestionnaireQuestionEntity {
    key: number;
    type: string;
    questionText: string;
    answers?: QuestionnaireAnswerEntity[];
    createdBy?: string;
    isOptional: boolean;
}
