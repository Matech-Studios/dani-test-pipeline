import { Test, TestingModule } from '@nestjs/testing';
import { eventDtoMock, publicEventResponseMock } from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { PublicController } from '../public.controller';
import { PublicService } from '../public.service';

describe('PublicController', () => {
    let controller: PublicController;
    let service: PublicService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PublicController],
            providers: [
                CustomLogger,
                {
                    provide: PublicService,
                    useValue: {
                        findEventById: jest.fn(),
                        findParticipantTicketNumber: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<PublicController>(PublicController);
        service = module.get<PublicService>(PublicService);
    });

    describe('findEventById', () => {
        it('should return the result of the service method', async () => {
            const mockResponse = publicEventResponseMock;
            jest.spyOn(service, 'findEventById').mockResolvedValue(mockResponse);

            const result = await controller.findEventById(eventDtoMock.id);

            expect(result).toEqual(mockResponse);
            expect(service.findEventById).toHaveBeenCalledWith(eventDtoMock.id);
        });
    });

    describe('findParticipantTicketNumber', () => {
        it('should return the result of the service method', async () => {
            const eventId = 'eventId1';
            const beneficiary = 'beneficiary';
            jest.spyOn(service, 'findParticipantTicketNumber').mockResolvedValue({
                beneficiary,
                ticketNumber: 12345,
                eventId: 'eventId1'
            });

            const result = await controller.findParticipantTicketNumber(eventId, beneficiary);

            expect(result).toEqual({
                beneficiary,
                ticketNumber: 12345,
                eventId: 'eventId1'
            });
            expect(service.findParticipantTicketNumber).toHaveBeenCalledWith(eventId, beneficiary);
        });
    });
});
