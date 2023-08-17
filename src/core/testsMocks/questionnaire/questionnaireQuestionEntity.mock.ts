import { QuestionnaireQuestionEntity } from 'src/core/entities';
import { questionnaireAnswersEntityMock } from './questionnaireAnswerEntity.mock';

export const questionnaireQuestionEntityMock: QuestionnaireQuestionEntity[] = [
    {
        key: 1,
        questionText: 'Question 1 text',
        isOptional: true,
        type: 'checkbox',
        answers: questionnaireAnswersEntityMock
    }
];
