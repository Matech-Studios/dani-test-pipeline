import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RafflesParticipantsDto } from 'src/core/dto/';
import {
    eventDtoMock,
    publicEventResponseMock,
    raffleParticipantDtoMock
} from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { PublicService } from '../public.service';

describe('PublicService', () => {
    let service: PublicService;
    let entityManager: EntityManager;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PublicService,
                {
                    provide: EntityManager,
                    useValue: {
                        findOne: jest.fn(),
                        findOneOrFail: jest.fn()
                    }
                },
                {
                    provide: CustomLogger,
                    useValue: {
                        error: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<PublicService>(PublicService);
        entityManager = module.get<EntityManager>(EntityManager);
    });

    describe('findEventById', () => {
        it('should throw an error if the event is not found', async () => {
            const eventId = 'eventId1';
            jest.spyOn(entityManager, 'findOneOrFail').mockReturnValue(null);

            await expect(service.findEventById(eventId)).rejects.toThrow(
                new HttpException(`Event not found: ${eventId}`, HttpStatus.NOT_FOUND)
            );
        });

        it('should return a PublicEventResponse if the event is found', async () => {
            jest.spyOn(entityManager, 'findOneOrFail').mockResolvedValue(eventDtoMock);

            const result = await service.findEventById(eventDtoMock.id);

            expect(result).toEqual(publicEventResponseMock);
        });
    });

    describe('findParticipantTicketNumber', () => {
        it('should throw an error if the participant has not completed a questionnaire', async () => {
            const eventId = 'eventId1';
            const beneficiary = 'beneficiary1';
            jest.spyOn(entityManager, 'findOne').mockResolvedValue(null);

            await expect(service.findParticipantTicketNumber(eventId, beneficiary)).rejects.toThrow(
                new BadRequestException('Please complete a questionnaire in order to participate')
            );
        });

        it('should return an AttendeeQuestionnaireResponse if the participant is found', async () => {
            const eventId = '1';
            const beneficiary = 'beneficiary';
            const participant: RafflesParticipantsDto = raffleParticipantDtoMock;
            jest.spyOn(entityManager, 'findOne').mockResolvedValue(participant);

            const result = await service.findParticipantTicketNumber(eventId, beneficiary);

            expect(result).toEqual({
                beneficiary,
                ticketNumber: 12345,
                eventId: '1'
            });
        });
    });
});
