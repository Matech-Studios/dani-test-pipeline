import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import {
    createEventRequestMock,
    editEventEntityMock,
    editEventRequestMock,
    editEventResponseMock,
    editedEventEntityMock,
    eventDtoMock,
    eventEntityListMock,
    eventEntityMock,
    eventResponseMock,
    eventsResponseListMock,
    getEventRequestMock
} from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { QuestionnairesService } from 'src/modules/questionnaires';
import { EventsController } from '../events.controller';
import { EventsService } from '../events.service';

describe('Events Controller', () => {
    let eventsController: EventsController;
    const entityManagerMock = {};

    const eventsServiceMock = {
        create: jest.fn(),
        edit: jest.fn().mockResolvedValue(editedEventEntityMock),
        find: jest.fn().mockResolvedValue(eventEntityListMock),
        findById: jest.fn().mockReturnValue(eventEntityMock)
    };

    const eventsServiceMockWithUserNotFoundError = {
        create: jest.fn(),
        edit: jest.fn().mockResolvedValue(editedEventEntityMock),
        find: jest.fn().mockResolvedValue(eventEntityListMock),
        findById: jest.fn().mockRejectedValue(new Error('User not found: 1)'))
    };

    const eventsServiceMockWithServerError = {
        create: jest.fn(),
        edit: jest.fn().mockResolvedValue(editedEventEntityMock),
        find: jest.fn().mockResolvedValue(eventEntityListMock),
        findById: jest.fn().mockRejectedValue(new Error('DB error'))
    };

    const userRequestMock = {
        user: { uid: '1', email: 'test@email.com' }
    } as unknown as Request;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                CustomLogger,
                QuestionnairesService,
                {
                    provide: EventsService,
                    useValue: eventsServiceMock
                },
                {
                    provide: EntityManager,
                    useValue: entityManagerMock
                }
            ]
        }).compile();

        eventsController = moduleRef.get<EventsController>(EventsController);
        jest.clearAllMocks();
    });

    describe('Create event', () => {
        it('then it should call eventService', async () => {
            await eventsController.create(userRequestMock, createEventRequestMock);
            expect(userRequestMock).toHaveProperty('user');
            expect(eventsServiceMock.create).toHaveBeenCalledWith({
                ...createEventRequestMock,
                externalUserId: userRequestMock.user['uid']
            });
            expect(eventsServiceMock.create).toBeCalledTimes(1);
        });
    });

    describe('when edit event is called', () => {
        it('then it should call eventService', async () => {
            const event = await eventsController.update(
                eventDtoMock.id,
                userRequestMock,
                editEventRequestMock
            );

            expect(userRequestMock).toHaveProperty('user');
            expect(eventsServiceMock.edit).toHaveBeenCalledWith(editEventEntityMock);

            expect(event).toEqual(editEventResponseMock);
        });
    });

    describe('when get event by Id is called', () => {
        it('then it should call eventService', async () => {
            const event = await eventsController.getEvent(getEventRequestMock, userRequestMock);

            expect(userRequestMock).toHaveProperty('user');
            expect(eventsServiceMock.findById).toHaveBeenCalledWith(
                getEventRequestMock,
                userRequestMock.user['uid']
            );
            expect(event).toEqual(eventResponseMock);
        });

        describe('and user is not found', () => {
            beforeEach(async () => {
                const moduleRef: TestingModule = await Test.createTestingModule({
                    controllers: [EventsController],
                    providers: [
                        CustomLogger,
                        QuestionnairesService,
                        {
                            provide: EventsService,
                            useValue: eventsServiceMockWithUserNotFoundError
                        },
                        {
                            provide: EntityManager,
                            useValue: entityManagerMock
                        }
                    ]
                }).compile();

                eventsController = moduleRef.get<EventsController>(EventsController);

                jest.clearAllMocks();
            });

            it('should throw not found error', async () => {
                try {
                    await eventsController.getEvent(getEventRequestMock, userRequestMock);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe('User not found: 1)');
                }
            });
        });

        describe('and server error raises', () => {
            beforeEach(async () => {
                const moduleRef: TestingModule = await Test.createTestingModule({
                    controllers: [EventsController],
                    providers: [
                        CustomLogger,
                        QuestionnairesService,
                        {
                            provide: EventsService,
                            useValue: eventsServiceMockWithServerError
                        },
                        {
                            provide: EntityManager,
                            useValue: entityManagerMock
                        }
                    ]
                }).compile();

                eventsController = moduleRef.get<EventsController>(EventsController);

                jest.clearAllMocks();
            });

            it('should throw internal server error', async () => {
                try {
                    await eventsController.getEvent(getEventRequestMock, userRequestMock);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe('DB error');
                }
            });
        });
    });

    describe('when get all events is called', () => {
        it('then it should call eventService', async () => {
            const events = await eventsController.getEvents(userRequestMock);
            expect(userRequestMock).toHaveProperty('user');
            expect(eventsServiceMock.find).toHaveBeenCalledWith(userRequestMock.user['uid']);
            expect(events).toEqual(eventsResponseListMock);
        });
    });
});
