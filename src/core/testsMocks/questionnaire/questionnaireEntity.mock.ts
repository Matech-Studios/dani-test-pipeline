import { QuestionnaireQuestionDto } from 'src/core/dto/questionnaireQuestion.dto';
import { UserDto } from 'src/core/dto/user.dto';
import { collectibleDtoMock, collectibleEntityMock } from '../../../core/testsMocks';

export const questionnaireEntityMock = {
    collectibleId: collectibleDtoMock.id,
    questions: [
        {
            key: 1,
            questionText: 'Question 1 text',
            type: 'checkbox',
            answers: [
                {
                    id: 'question-1',
                    answerKey: 1,
                    answerText: 'Question 1 text',
                    question: new QuestionnaireQuestionDto(),
                    createdAt: Date.now(),
                    createdBy: new UserDto()
                },
                {
                    id: 'question-2',
                    answerKey: 2,
                    answerText: 'Question 2 text',
                    question: new QuestionnaireQuestionDto(),
                    createdAt: Date.now(),
                    createdBy: new UserDto()
                }
            ]
        }
    ],
    createdBy: collectibleEntityMock.createdBy
};
