import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { QuestionnaireQuestionDto } from 'src/core/dto/questionnaireQuestion.dto';

export const questionnaireQuestionDtoMock: QuestionnaireQuestionDto = {
    id: 'question-1',
    key: 1,
    questionText: 'Question 1 text',
    isOptional: true,
    type: 'checkbox',
    createdAt: Date.now(),
    createdBy: 'user-id',
    collectible: new CollectibleDto()
};
