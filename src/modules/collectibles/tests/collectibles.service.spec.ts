import { EntityManager } from '@mikro-orm/core';
import { EntityManager as PostgresEntityManager } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { S3 } from 'aws-sdk';
import { createAwsServiceMock } from 'nest-aws-sdk/dist/testing';
import { CollectibleDto } from 'src/core/dto/collectible.dto';
import {
    collectibleDtoMock,
    collectibleEntityMock,
    eventDtoMock,
    questionnaireQuestionEntityMock,
    userDtoMock
} from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { ExternalPoapService } from '../../external-poap';
import { QuestionnairesService } from '../../questionnaires';
import { S3ManagerService } from '../../s3';
import { CollectiblesService } from '../collectibles.service';

describe('Collectibles Service', () => {
    let service: CollectiblesService;

    process.env = {
        AWS_BASE_URL: 'http://base.url/',
        AWS_BUCKET: 'bucket-app'
    };

    const s3ServiceMock = {
        uploadFile: jest.fn().mockResolvedValue({ key: 'mykey.png' })
    };

    const questionnairesServiceMock = {
        deleteByCollectibleId: jest.fn()
    };

    describe('create', () => {
        const entityManagerMock = {
            create: jest.fn().mockReturnValue(collectibleDtoMock),
            findOne: jest.fn().mockReturnValueOnce(userDtoMock).mockReturnValueOnce(eventDtoMock),
            persistAndFlush: jest.fn(),
            find: jest.fn().mockReturnValue([collectibleDtoMock]),
            assign: jest.fn().mockResolvedValue(collectibleDtoMock),
            flush: jest.fn()
        };

        beforeEach(async () => {
            jest.clearAllMocks();

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    ExternalPoapService,
                    S3ManagerService,
                    createAwsServiceMock(S3, {
                        useValue: {
                            deleteObject: () => null,
                            getObject: () => null,
                            upload: () => null
                        }
                    }),
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: QuestionnairesService,
                        useValue: questionnairesServiceMock
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);
        });

        it('creates a collectible with questionnaire', async () => {
            collectibleEntityMock.image = null;

            const result = await service.create({
                ...collectibleEntityMock,
                questions: questionnaireQuestionEntityMock
            });

            expect(entityManagerMock.findOne).toHaveBeenCalledTimes(2);

            expect(entityManagerMock.create).toHaveBeenCalledWith(CollectibleDto, {
                ...collectibleEntityMock,
                attendees: collectibleEntityMock.attendees,
                event: eventDtoMock,
                createdBy: userDtoMock.id,
                questions: questionnaireQuestionEntityMock
            });

            expect(s3ServiceMock.uploadFile).not.toHaveBeenCalled();

            expect(entityManagerMock.persistAndFlush).toHaveBeenCalledWith(collectibleDtoMock);

            expect(result).toEqual({
                id: collectibleDtoMock.id,
                name: collectibleDtoMock.name,
                attendees: collectibleDtoMock.attendees,
                description: collectibleDtoMock.description,
                event: collectibleDtoMock.event,
                image: 'http://base.urlmykey.png',
                externalPoapId: undefined,
                externalPoapError: null,
                questions: [],
                website: collectibleDtoMock.website
            });

            expect(questionnairesServiceMock.deleteByCollectibleId).not.toHaveBeenCalledWith();
        });
    });

    describe('create with no questions', () => {
        const entityManagerMock = {
            create: jest.fn().mockReturnValue(collectibleDtoMock),
            findOne: jest.fn().mockReturnValueOnce(userDtoMock).mockReturnValueOnce(eventDtoMock),
            persistAndFlush: jest.fn(),
            assign: jest.fn().mockResolvedValue(collectibleDtoMock),
            flush: jest.fn()
        };

        beforeEach(async () => {
            jest.clearAllMocks();

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    QuestionnairesService,
                    ExternalPoapService,
                    S3ManagerService,
                    createAwsServiceMock(S3, {
                        useValue: {
                            deleteObject: () => null,
                            getObject: () => null,
                            upload: () => null
                        }
                    }),
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);
        });

        it('creates a collectible with no questions', async () => {
            collectibleEntityMock.image = null;

            const result = await service.create(collectibleEntityMock);

            expect(entityManagerMock.findOne).toHaveBeenCalledTimes(2);

            expect(entityManagerMock.create).toHaveBeenCalledWith(CollectibleDto, {
                ...collectibleEntityMock,
                attendees: collectibleEntityMock.attendees,
                event: eventDtoMock,
                createdBy: userDtoMock.id,
                image: null
            });

            expect(entityManagerMock.persistAndFlush).toHaveBeenCalledWith(collectibleDtoMock);

            expect(s3ServiceMock.uploadFile).not.toHaveBeenCalled();

            expect(result).toEqual({
                id: collectibleDtoMock.id,
                name: collectibleDtoMock.name,
                attendees: collectibleDtoMock.attendees,
                description: collectibleDtoMock.description,
                event: collectibleDtoMock.event,
                image: 'http://base.urlmykey.png',
                externalPoapId: undefined,
                externalPoapError: null,
                questions: [],
                website: collectibleDtoMock.website
            });
        });
    });

    describe('create', () => {
        it('throw error if create from Entity Manager fails', async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    QuestionnairesService,
                    ExternalPoapService,
                    S3ManagerService,
                    createAwsServiceMock(S3, {
                        useValue: {
                            deleteObject: () => null,
                            getObject: () => null,
                            upload: () => null
                        }
                    }),
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    },
                    {
                        provide: EntityManager,
                        useValue: {
                            create: jest.fn().mockImplementation(() => {
                                throw new Error('mock error');
                            }),
                            findOne: jest.fn().mockReturnValue(collectibleDtoMock),
                            persistAndFlush: jest.fn().mockResolvedValue(collectibleDtoMock),
                            find: jest.fn().mockReturnValue([collectibleDtoMock]),
                            findOneOrFail: jest.fn().mockReturnValue(collectibleDtoMock),
                            removeAndFlush: jest.fn().mockResolvedValue(collectibleDtoMock),
                            assign: jest.fn().mockResolvedValue(collectibleDtoMock)
                        }
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);

            try {
                await service.create(collectibleEntityMock);

                expect(true).toBe(false);
            } catch (err) {
                expect(err.message).toBe('mock error');
            }
        });
    });

    describe('getById', () => {
        const entityManagerMock = {
            findOne: jest
                .fn()
                .mockReturnValueOnce(userDtoMock)
                .mockReturnValueOnce({
                    ...collectibleDtoMock,
                    image: 'someimage.png'
                })
        };

        beforeEach(async () => {
            jest.clearAllMocks();

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    ExternalPoapService,
                    S3ManagerService,
                    createAwsServiceMock(S3, {
                        useValue: {
                            deleteObject: () => null,
                            getObject: () => null,
                            upload: () => null
                        }
                    }),
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: QuestionnairesService,
                        useValue: questionnairesServiceMock
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);
        });

        it('gets a collectible', async () => {
            const result = await service.getById({
                collectibleId: collectibleEntityMock.id,
                createdBy: collectibleEntityMock.createdBy
            });

            expect(entityManagerMock.findOne).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                ...collectibleDtoMock,
                image: `${process.env.AWS_BASE_URL}someimage.png`
            });
        });

        it('if collectible does not exist throw an error', async () => {
            const entityManagerMockCopy = {
                findOne: jest.fn().mockReturnValueOnce(userDtoMock).mockReturnValueOnce(undefined)
            };
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    ExternalPoapService,
                    {
                        provide: QuestionnairesService,
                        useValue: questionnairesServiceMock
                    },
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMockCopy
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);

            try {
                expect(
                    await service.getById({
                        collectibleId: collectibleEntityMock.id,
                        createdBy: collectibleEntityMock.createdBy
                    })
                ).toThrowError();
            } catch (error) {
                expect(entityManagerMockCopy.findOne).toHaveBeenCalledTimes(2);
            }
        });

        it('if user does not exist throw an error', async () => {
            const entityManagerMockCopy = {
                findOne: jest.fn().mockReturnValueOnce(undefined).mockReturnValueOnce(undefined)
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    ExternalPoapService,
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: QuestionnairesService,
                        useValue: questionnairesServiceMock
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMockCopy
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);

            try {
                expect(
                    await service.getById({
                        collectibleId: collectibleEntityMock.id,
                        createdBy: collectibleEntityMock.createdBy
                    })
                ).toThrowError();
            } catch (error) {
                expect(entityManagerMockCopy.findOne).toHaveBeenCalledTimes(1);
            }
        });
    });

    describe('updateById', () => {
        const entityManagerMock = {
            findOne: jest
                .fn()
                .mockReturnValueOnce(userDtoMock)
                .mockReturnValueOnce(collectibleDtoMock),
            assign: jest.fn(),
            flush: jest.fn()
        };

        const questionnairesServiceMock = {
            deleteByCollectibleId: jest.fn()
        };

        const now = 1674139117275;
        jest.spyOn(Date, 'now').mockImplementation(() => now);

        beforeEach(async () => {
            jest.clearAllMocks();

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    ExternalPoapService,
                    S3ManagerService,
                    createAwsServiceMock(S3, {
                        useValue: {
                            deleteObject: () => null,
                            getObject: () => null,
                            upload: () => null
                        }
                    }),
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: QuestionnairesService,
                        useValue: questionnairesServiceMock
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);
        });

        it('updates a collectible', async () => {
            const result = await service.updateById({
                attendees: collectibleEntityMock.attendees,
                description: collectibleEntityMock.description,
                name: collectibleEntityMock.name,
                id: collectibleEntityMock.id,
                updatedBy: collectibleEntityMock.createdBy,
                image: `${process.env.AWS_BASE_URL}someimage.png`
            });

            expect(entityManagerMock.findOne).toHaveBeenCalledTimes(2);
            expect(questionnairesServiceMock.deleteByCollectibleId).toHaveBeenCalledWith(
                collectibleEntityMock.id,
                userDtoMock.externalUserId
            );
            expect(entityManagerMock.assign).toHaveBeenCalledWith(collectibleDtoMock, {
                attendees: collectibleEntityMock.attendees,
                description: collectibleEntityMock.description,
                name: collectibleEntityMock.name,
                id: collectibleEntityMock.id,
                updatedBy: userDtoMock.id,
                image: 'someimage.png',
                externalPoapId: undefined,
                questions: undefined
            });
            expect(entityManagerMock.flush).toHaveBeenCalled();
            expect(result).toEqual({
                id: collectibleDtoMock.id,
                name: collectibleDtoMock.name,
                attendees: collectibleDtoMock.attendees,
                description: collectibleDtoMock.description,
                event: collectibleDtoMock.event,
                image: `${process.env.AWS_BASE_URL}someimage.png`,
                externalPoapId: undefined,
                externalPoapError: null,
                questions: [],
                website: collectibleDtoMock.website
            });
        });
    });
});
