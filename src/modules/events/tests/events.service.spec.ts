import { EntityManager, NotFoundError } from '@mikro-orm/core';
import { EntityManager as PostgresEntityManager } from '@mikro-orm/postgresql';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventDto } from 'src/core/dto/event.dto';
import { CreateEventEntity, EditEventEntity } from 'src/core/entities';
import { EventEntity } from 'src/core/entities/event.entity';
import {
    createEventEntityMock,
    createEventRequestMock,
    editEventEntityMock,
    eventDtoMock,
    userDecodedMock,
    userDtoMock
} from 'src/core/testsMocks';
import { eventDtoListMock } from 'src/core/testsMocks/event/eventDtoList.mock';
import { CustomLogger } from 'src/core/utils';
import { CollectiblesService } from 'src/modules/collectibles/collectibles.service';
import { ExternalPoapService } from 'src/modules/external-poap';
import { QuestionnairesService } from 'src/modules/questionnaires';
import { S3ManagerService } from 'src/modules/s3';
import { eventEntityListMock } from '../../../core/testsMocks/event/eventEntityList.mock';
import { UsersService } from '../../users/users.service';
import { EventsService } from '../events.service';

describe('Events Service', () => {
    let eventsService: EventsService;
    const imageName = 'mykey.png';

    const entityManagerMock = {
        create: jest.fn().mockResolvedValue(eventDtoMock),
        find: jest.fn().mockResolvedValue(eventDtoListMock),
        findOneOrFail: jest.fn().mockResolvedValue(eventDtoMock),
        flush: jest.fn(),
        persistAndFlush: jest.fn(),
        assign: jest.fn()
    };

    const usersServiceMock = {
        findOneByExternalId: jest.fn().mockResolvedValue(userDtoMock)
    };

    const s3ServiceMock = {
        uploadFile: jest.fn().mockResolvedValue({ key: imageName })
    };

    const now = 1674139117275;
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    describe('CRUD events should success ', () => {
        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    EventsService,
                    QuestionnairesService,
                    ExternalPoapService,
                    CollectiblesService,
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: UsersService,
                        useValue: usersServiceMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            eventsService = module.get<EventsService>(EventsService);
        });

        describe('Create event', () => {
            describe('Create event success', () => {
                it('then it should call usersService', async () => {
                    await eventsService.create(createEventEntityMock);

                    expect(usersServiceMock.findOneByExternalId).toHaveBeenCalledWith(
                        userDtoMock.externalUserId
                    );
                    expect(entityManagerMock.create).toHaveBeenCalled();
                    expect(entityManagerMock.create).toBeCalledTimes(1);
                    expect(entityManagerMock.persistAndFlush).toHaveBeenCalled();
                    expect(entityManagerMock.persistAndFlush).toBeCalledTimes(1);
                });
            });
        });

        describe('Edit event', () => {
            describe('Edit event success', () => {
                it('then it should call usersService and EntityManager', async () => {
                    await eventsService.edit(editEventEntityMock);

                    expect(usersServiceMock.findOneByExternalId).toHaveBeenCalledWith(
                        userDtoMock.externalUserId
                    );
                    expect(entityManagerMock.findOneOrFail).toHaveBeenCalledWith(
                        EventDto,
                        editEventEntityMock.id
                    );
                    expect(entityManagerMock.assign).toHaveBeenCalledWith(eventDtoMock, {
                        ...editEventEntityMock,
                        updatedBy: userDtoMock.id,
                        updatedAt: now
                    });
                    expect(entityManagerMock.flush).toBeCalledTimes(1);
                });
            });
        });

        describe('Get all events', () => {
            let events: EventEntity[];
            it('then it should call usersService', async () => {
                events = await eventsService.find(userDtoMock.externalUserId);

                expect(usersServiceMock.findOneByExternalId).toHaveBeenCalledWith(
                    userDtoMock.externalUserId
                );
                expect(entityManagerMock.find).toHaveBeenCalledWith(EventDto, {
                    createdBy: userDtoMock.id
                });
                expect(entityManagerMock.find).toBeCalledTimes(1);
                expect(events).toEqual([
                    {
                        createdAt: eventDtoListMock[0].createdAt,
                        createdBy: eventEntityListMock[0].createdBy,
                        description: eventEntityListMock[0].description,
                        endDate: eventEntityListMock[0].endDate,
                        id: eventEntityListMock[0].id,
                        city: eventEntityListMock[0].city,
                        country: eventEntityListMock[0].country,
                        name: eventEntityListMock[0].name,
                        poapsQuantity: eventEntityListMock[0].poapsQuantity,
                        startDate: eventEntityListMock[0].startDate,
                        location: eventEntityListMock[0].location,
                        virtual: eventEntityListMock[0].virtual,
                        attendees: eventEntityListMock[0].attendees
                    },
                    {
                        createdAt: eventDtoListMock[1].createdAt,
                        createdBy: eventEntityListMock[1].createdBy,
                        description: eventEntityListMock[1].description,
                        endDate: eventEntityListMock[1].endDate,
                        id: eventEntityListMock[1].id,
                        city: eventEntityListMock[1].city,
                        country: eventEntityListMock[1].country,
                        name: eventEntityListMock[1].name,
                        poapsQuantity: eventEntityListMock[1].poapsQuantity,
                        startDate: eventEntityListMock[1].startDate,
                        location: eventEntityListMock[1].location,
                        virtual: eventEntityListMock[1].virtual,
                        attendees: eventEntityListMock[1].attendees
                    }
                ]);
            });
        });

        describe('Get event by id', () => {
            let event: EventEntity;
            it('then it should call usersService', async () => {
                event = await eventsService.findById(
                    eventDtoMock.id,
                    userDecodedMock.externalUserId
                );
                expect(usersServiceMock.findOneByExternalId).toHaveBeenCalledWith(
                    userDecodedMock.externalUserId
                );

                expect(entityManagerMock.findOneOrFail).toHaveBeenCalledWith(
                    EventDto,
                    {
                        id: eventDtoMock.id,
                        createdBy: eventDtoMock.createdBy
                    },
                    {
                        populate: [
                            'collectibles',
                            'collectibles.questions',
                            'createdBy',
                            'updatedBy',
                            'companyId',
                            'raffles',
                            'raffles.winners',
                            'raffles.winners.raffleParticipant'
                        ]
                    }
                );

                expect(event).toEqual({
                    ...eventDtoMock,
                    collectibles: [],
                    raffles: []
                });
            });
        });
    });

    describe('CRUD events should fail when user is not found', () => {
        let eventEntityMock: CreateEventEntity;
        let editEventEntityMock: EditEventEntity;

        beforeEach(async () => {
            const usersServiceMock = {
                findOneByExternalId: jest
                    .fn()
                    .mockRejectedValue(
                        new NotFoundError('UserDto not found ({ externalUserId: null })')
                    )
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    EventsService,
                    QuestionnairesService,
                    ExternalPoapService,
                    CollectiblesService,
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: UsersService,
                        useValue: usersServiceMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();
            eventsService = module.get<EventsService>(EventsService);
        });

        it('Edit should fail when called usersService received null userId', async () => {
            editEventEntityMock = {
                ...eventEntityMock,
                id: '1',
                externalUserId: null,
                attendees: 45
            };

            try {
                await eventsService.edit(editEventEntityMock);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe('UserDto not found ({ externalUserId: null })');
            }
        });

        it('Create event should fail when called usersService received null user', async () => {
            eventEntityMock = {
                id: '1',
                ...createEventRequestMock,
                externalUserId: userDecodedMock.externalUserId
            };

            try {
                await eventsService.create(eventEntityMock);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe('UserDto not found ({ externalUserId: null })');
            }
        });

        it('Find should fail when called usersService received null user', async () => {
            try {
                await eventsService.find(null);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe('UserDto not found ({ externalUserId: null })');
            }
        });

        it('Find by id should fail when usersService throws error', async () => {
            try {
                await eventsService.findById(eventDtoMock.id, userDecodedMock.externalUserId);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe('UserDto not found ({ externalUserId: null })');
            }
        });

        it('Find by id should fail when user is not found', async () => {
            const usersServiceMockWithUserNotFound = {
                findOneByExternalId: jest.fn().mockResolvedValue(null)
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    EventsService,
                    QuestionnairesService,
                    ExternalPoapService,
                    CollectiblesService,
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: UsersService,
                        useValue: usersServiceMockWithUserNotFound
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();
            eventsService = module.get<EventsService>(EventsService);

            try {
                await eventsService.findById(eventDtoMock.id, userDecodedMock.externalUserId);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(usersServiceMockWithUserNotFound.findOneByExternalId).toHaveBeenCalledWith(
                    userDecodedMock.externalUserId
                );
                expect(e).toMatchObject({
                    response: 'User not found: 1313',
                    status: 404,
                    options: undefined
                });
            }
        });

        it('Find by id should fail when event is not found', async () => {
            const entityManagerMockWithEventNotFound = {
                create: jest.fn(),
                find: jest.fn().mockResolvedValue(eventDtoListMock),
                findOneOrFail: jest.fn().mockResolvedValue(null),
                flush: jest.fn(),
                persistAndFlush: jest.fn(),
                assign: jest.fn()
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    EventsService,
                    QuestionnairesService,
                    ExternalPoapService,
                    CollectiblesService,
                    {
                        provide: EntityManager,
                        useValue: entityManagerMockWithEventNotFound
                    },
                    {
                        provide: UsersService,
                        useValue: usersServiceMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();
            eventsService = module.get<EventsService>(EventsService);

            try {
                await eventsService.findById(eventDtoMock.id, userDecodedMock.externalUserId);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e).toMatchObject({
                    response: 'Event not found: 1',
                    status: 404,
                    options: undefined
                });
                expect(usersServiceMock.findOneByExternalId).toHaveBeenCalledWith(
                    userDtoMock.externalUserId
                );
                expect(entityManagerMockWithEventNotFound.findOneOrFail).toHaveBeenCalledWith(
                    EventDto,
                    {
                        id: eventDtoMock.id,
                        createdBy: userDtoMock.id
                    },
                    {
                        populate: [
                            'collectibles',
                            'collectibles.questions',
                            'createdBy',
                            'updatedBy',
                            'companyId',
                            'raffles',
                            'raffles.winners',
                            'raffles.winners.raffleParticipant'
                        ]
                    }
                );
            }
        });
    });

    describe('Edit & GetById events should fail when event not found', () => {
        let eventEntityMock: CreateEventEntity;
        let editEventEntityMock: EditEventEntity;

        beforeEach(async () => {
            jest.clearAllMocks();

            const usersServiceMock = {
                findOneByExternalId: jest
                    .fn()
                    .mockRejectedValue(
                        new NotFoundError(`Event not found ({ id: ${eventDtoMock.id} })`)
                    )
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    EventsService,
                    QuestionnairesService,
                    ExternalPoapService,
                    CollectiblesService,
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: UsersService,
                        useValue: usersServiceMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();
            eventsService = module.get<EventsService>(EventsService);
        });

        it('Edit event should fail when called EntityManagaer not found the event', async () => {
            try {
                editEventEntityMock = {
                    ...eventEntityMock,
                    id: '1',
                    externalUserId: '1',
                    attendees: 45
                };

                await eventsService.edit(editEventEntityMock);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe(`Event not found ({ id: ${eventDtoMock.id} })`);
            }
        });

        it('Create event should fail when called EntityManagaer not found the event', async () => {
            eventEntityMock = {
                id: '1',
                ...createEventRequestMock,
                externalUserId: userDecodedMock.externalUserId
            };

            try {
                await eventsService.create(eventEntityMock);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe(`Event not found ({ id: ${eventDtoMock.id} })`);
            } finally {
                expect(entityManagerMock.create).not.toHaveBeenCalled();
                expect(entityManagerMock.persistAndFlush).not.toHaveBeenCalled();
            }
        });

        it('Find event should fail when called EntityManagaer not found the event', async () => {
            try {
                await eventsService.find(null);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe(`Event not found ({ id: ${eventDtoMock.id} })`);
            }
        });

        it('find event by id should fail when called EntityManagaer not found the event', async () => {
            try {
                await eventsService.findById(eventDtoMock.id, userDecodedMock.externalUserId);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError);
                expect(e.message).toBe(`Event not found ({ id: ${eventDtoMock.id} })`);
            }
        });
    });
});
