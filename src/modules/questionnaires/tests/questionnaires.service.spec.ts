import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireQuestionDto } from 'src/core/dto/questionnaireQuestion.dto';
import { collectibleDtoMock, questionnaireEntityMock } from 'src/core/testsMocks';
import { userDtoMock } from 'src/core/testsMocks/user/userDto.mock';
import { CustomLogger } from 'src/core/utils';
import { QuestionnairesService } from '../questionnaires.service';

describe('Questionnaires Service', () => {
    let service: QuestionnairesService;

    const mockedEntityManager = {
        findOne: jest.fn().mockReturnValueOnce(userDtoMock).mockReturnValueOnce(collectibleDtoMock),
        nativeDelete: jest.fn(),
        flush: jest.fn()
    };

    const mockedCustomLogger = {
        error: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionnairesService,
                {
                    provide: CustomLogger,
                    useValue: mockedCustomLogger
                },
                {
                    provide: EntityManager,
                    useValue: mockedEntityManager
                }
            ]
        }).compile();

        service = module.get<QuestionnairesService>(QuestionnairesService);
    });

    describe('delete', () => {
        it('deletes a questionnaire with answers', async () => {
            await service.deleteByCollectibleId(
                questionnaireEntityMock.collectibleId,
                questionnaireEntityMock.createdBy
            );

            expect(mockedEntityManager.findOne).toHaveBeenCalledTimes(2);
            expect(mockedEntityManager.nativeDelete).toHaveBeenCalledWith(
                QuestionnaireQuestionDto,
                {
                    collectible: collectibleDtoMock,
                    createdBy: userDtoMock.id
                }
            );
            expect(mockedEntityManager.flush).toHaveBeenCalled();
            expect(mockedCustomLogger.error).not.toHaveBeenCalled();
        });
    });
});
