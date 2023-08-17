import { EntityManager } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
    CollectibleRaffleDto,
    QuestionnaireAttendeeResponseDto,
    RaffleDto,
    RaffleWinnersDto,
    RafflesParticipantsDto,
    UserDto
} from 'src/core/dto';
import {
    collectibleDtoListMock,
    collectibleRaffleDtoMock,
    eventDtoMock,
    raffleDtoMock,
    raffleParticipantDtoMock,
    userDtoMock
} from 'src/core/testsMocks';
import { RaffleDataAccessService } from 'src/modules/raffles/raffleDataAccess.service';

let mockEntityManager;

function createMockEntityManager() {
    return {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        persist: jest.fn(),
        flush: jest.fn()
    };
}

describe('RaffleDataAccessService', () => {
    let service: RaffleDataAccessService;

    beforeEach(async () => {
        mockEntityManager = createMockEntityManager();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RaffleDataAccessService,
                { provide: EntityManager, useValue: mockEntityManager }
            ]
        }).compile();

        service = module.get<RaffleDataAccessService>(RaffleDataAccessService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getRaffleAndCollectibles', () => {
        it('should return raffle and collectibles', async () => {
            mockEntityManager.findOne.mockResolvedValueOnce(raffleDtoMock);
            mockEntityManager.find.mockResolvedValue([collectibleRaffleDtoMock]);

            const result = await service.getRaffleAndCollectibles(raffleDtoMock.id, userDtoMock);

            expect(result).toEqual({
                raffle: raffleDtoMock,
                raffleLinkedCollectibles: [collectibleRaffleDtoMock]
            });
            expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
            expect(mockEntityManager.findOne).toHaveBeenCalledWith(
                RaffleDto,
                { id: raffleDtoMock.id, createdBy: userDtoMock.id },
                { populate: ['prizes', 'winners', 'event'] }
            );
            expect(mockEntityManager.find).toHaveBeenCalledTimes(1);
            expect(mockEntityManager.find).toHaveBeenCalledWith(
                CollectibleRaffleDto,
                { raffleId: raffleDtoMock.id },
                { populate: ['collectibleId'] }
            );
        });
    });

    describe('getUserByExternalUserId', () => {
        it('should return user by external user id', async () => {
            mockEntityManager.findOne.mockResolvedValueOnce(userDtoMock);

            const result = await service.getUserByExternalUserId(userDtoMock.externalUserId);

            expect(result).toEqual(userDtoMock);
            expect(mockEntityManager.findOne).toHaveBeenCalledWith(UserDto, {
                externalUserId: userDtoMock.externalUserId
            });
        });
    });

    describe('getParticipant', () => {
        let mockEntityManager;
        let service;

        beforeEach(() => {
            mockEntityManager = createMockEntityManager();
            service = new RaffleDataAccessService(mockEntityManager);
        });

        it('should return participant', async () => {
            const beneficiary = 'testBeneficiary';
            const expectedParticipant = raffleParticipantDtoMock;

            mockEntityManager.findOne.mockResolvedValue(expectedParticipant);

            const actualParticipant = await service.getParticipant(beneficiary, eventDtoMock);

            expect(actualParticipant).toEqual(expectedParticipant);
            expect(mockEntityManager.findOne).toHaveBeenCalledWith(RafflesParticipantsDto, {
                beneficiary,
                event: eventDtoMock
            });
        });

        it('should throw an error if no participant found', async () => {
            const beneficiary = 'testBeneficiary';

            mockEntityManager.findOne.mockResolvedValue(null);

            await expect(service.getParticipant(beneficiary, eventDtoMock)).rejects.toThrow(
                BadRequestException
            );

            expect(mockEntityManager.findOne).toHaveBeenCalledWith(RafflesParticipantsDto, {
                beneficiary,
                event: eventDtoMock
            });
        });
    });

    describe('saveRaffleResult', () => {
        it('should save raffle result', async () => {
            await service.saveRaffleResult(
                raffleDtoMock.id,
                userDtoMock.id,
                raffleParticipantDtoMock
            );

            expect(mockEntityManager.create).toHaveBeenCalledWith(RaffleWinnersDto, {
                raffle: raffleDtoMock.id,
                beneficiary: raffleParticipantDtoMock.beneficiary,
                createdBy: userDtoMock.id,
                raffleParticipant: raffleParticipantDtoMock
            });
            expect(mockEntityManager.persist).toHaveBeenCalledTimes(1);
            expect(mockEntityManager.flush).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAvailableRaffleBeneficiaries', () => {
        const raffleLinkedCollectiblesIds = ['1', '2'];
        const mockRaffleWinnersDtoArrayOneWinner = [{ beneficiary: 'beneficiary1' }];
        const mockRaffleWinnersDtoArrayTwoWinners: RaffleWinnersDto[] = [
            {
                id: '1',
                beneficiary: 'beneficiary1',
                raffle: raffleDtoMock,
                createdBy: '1',
                createdAt: Date.now()
            },
            {
                id: '2',
                beneficiary: 'beneficiary2',
                raffle: raffleDtoMock,
                createdBy: '1',
                createdAt: Date.now()
            }
        ];
        const mockQuestionnaireAttendeeResponseDtoArrayTwoParticipantsSameAsWinners: QuestionnaireAttendeeResponseDto[] =
            [
                {
                    id: '1',
                    question: '1',
                    answer: 'asdas',
                    collectible: collectibleDtoListMock[0],
                    beneficiary: 'beneficiary1',
                    createdAt: Date.now()
                },
                {
                    id: '2',
                    question: '1',
                    answer: 'asdasd',
                    collectible: collectibleDtoListMock[1],
                    beneficiary: 'beneficiary1',
                    createdAt: Date.now()
                },
                {
                    id: '3',
                    question: '1',
                    answer: 'asdsa',
                    collectible: collectibleDtoListMock[1],
                    beneficiary: 'beneficiary2',
                    createdAt: Date.now()
                },
                {
                    id: '5',
                    question: '2',
                    answer: 'asdsa',
                    collectible: collectibleDtoListMock[0],
                    beneficiary: 'beneficiary1',
                    createdAt: Date.now()
                }
            ];
        const mockQuestionnaireAttendeeResponseDtoArray: QuestionnaireAttendeeResponseDto[] = [
            {
                id: '1',
                question: '1',
                answer: 'asdas',
                collectible: collectibleDtoListMock[0],
                beneficiary: 'beneficiary1',
                createdAt: Date.now()
            },
            {
                id: '2',
                question: '1',
                answer: 'asdasd',
                collectible: collectibleDtoListMock[1],
                beneficiary: 'beneficiary1',
                createdAt: Date.now()
            },
            {
                id: '3',
                question: '1',
                answer: 'asdsa',
                collectible: collectibleDtoListMock[1],
                beneficiary: 'beneficiary2',
                createdAt: Date.now()
            },
            {
                id: '4',
                question: '1',
                answer: 'asdsa',
                collectible: collectibleDtoListMock[1],
                beneficiary: 'beneficiary3',
                createdAt: Date.now()
            },
            {
                id: '5',
                question: '2',
                answer: 'asdsa',
                collectible: collectibleDtoListMock[0],
                beneficiary: 'beneficiary1',
                createdAt: Date.now()
            }
        ];

        it('should return available raffle beneficiaries', async () => {
            mockEntityManager.find
                .mockResolvedValueOnce(mockRaffleWinnersDtoArrayOneWinner)
                .mockResolvedValueOnce(mockQuestionnaireAttendeeResponseDtoArray);

            const result = await service.getAvailableRaffleBeneficiaries(
                raffleLinkedCollectiblesIds,
                raffleDtoMock.id
            );

            expect(result).toEqual([
                { collectibleId: '2', beneficiary: 'beneficiary2' },
                { collectibleId: '2', beneficiary: 'beneficiary3' }
            ]);
            expect(mockEntityManager.find).toHaveBeenNthCalledWith(1, RaffleWinnersDto, {
                raffle: raffleDtoMock.id
            });
            expect(mockEntityManager.find).toHaveBeenNthCalledWith(
                2,
                QuestionnaireAttendeeResponseDto,
                { collectible: { $in: raffleLinkedCollectiblesIds } }
            );
        });

        it('should throw an error if no beneficiaries left', async () => {
            mockEntityManager.find
                .mockResolvedValueOnce(mockRaffleWinnersDtoArrayTwoWinners)
                .mockResolvedValueOnce(
                    mockQuestionnaireAttendeeResponseDtoArrayTwoParticipantsSameAsWinners
                );

            await expect(
                service.getAvailableRaffleBeneficiaries(
                    raffleLinkedCollectiblesIds,
                    raffleDtoMock.id
                )
            ).rejects.toThrow(BadRequestException);
        });
    });
});
