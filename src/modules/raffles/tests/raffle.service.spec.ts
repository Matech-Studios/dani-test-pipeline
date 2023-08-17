import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { EventDto } from 'src/core/dto/event.dto';
import { PrizeDto } from 'src/core/dto/prize.dto';
import { RaffleDto } from 'src/core/dto/raffle.dto';
import { UserDto } from 'src/core/dto/user.dto';
import {
    collectibleRaffleDtoMock,
    createRafflesEntityMock,
    eventDtoMock,
    prizeDtoMock,
    raffleDtoMock,
    raffleParticipantDtoMock,
    userDtoMock
} from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { RaffleDataAccessService } from 'src/modules/raffles/raffleDataAccess.service';
import { RaffleHelpers } from '../raffles.helper.service';
import { RafflesService } from '../raffles.service';

describe('Raffles Service', () => {
    let raffleService: RafflesService;

    const entityManagerMock = {
        find: jest.fn().mockResolvedValue([
            {
                ...raffleDtoMock,
                id: 123456
            }
        ]),
        findOne: jest
            .fn()
            .mockResolvedValueOnce(userDtoMock)
            .mockResolvedValueOnce(eventDtoMock)
            .mockResolvedValueOnce(null),
        create: jest.fn().mockResolvedValueOnce(raffleDtoMock).mockResolvedValueOnce(prizeDtoMock),
        remove: jest.fn(),
        persist: jest.fn(),
        flush: jest.fn()
    };
    const raffleHelpersMock = {
        checkTheRaffleHasCollectiblesLinked: jest.fn()
    };
    const mockRaffleDataAccessService = {};

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RafflesService,
                CustomLogger,
                {
                    provide: EntityManager,
                    useValue: entityManagerMock
                },
                {
                    provide: RaffleHelpers,
                    useValue: raffleHelpersMock
                },
                {
                    provide: RaffleDataAccessService,
                    useValue: mockRaffleDataAccessService
                }
            ]
        }).compile();

        raffleService = module.get<RafflesService>(RafflesService);
    });

    it('should be defined', () => {
        expect(raffleService).toBeDefined();
    });

    describe('create', () => {
        it('should create multiple raffles', async () => {
            await raffleService.upsert(createRafflesEntityMock);

            expect(entityManagerMock.findOne).toHaveBeenCalledWith(UserDto, {
                externalUserId: createRafflesEntityMock.externalUserId
            });

            expect(entityManagerMock.findOne).toHaveBeenCalledWith(EventDto, {
                id: createRafflesEntityMock.eventId,
                createdBy: userDtoMock.id
            });

            expect(entityManagerMock.find).toHaveBeenCalledWith(RaffleDto, {
                event: eventDtoMock
            });

            expect(entityManagerMock.remove).toHaveBeenCalledWith({
                ...raffleDtoMock,
                id: 123456
            });

            expect(entityManagerMock.create).toHaveBeenCalledWith(RaffleDto, {
                name: createRafflesEntityMock.raffles[0].name,
                key: createRafflesEntityMock.raffles[0].key,
                useWeight: true,
                event: eventDtoMock,
                createdBy: userDtoMock.id
            });

            const prize = createRafflesEntityMock.raffles[0].prizes[0];

            expect(entityManagerMock.create).toHaveBeenCalledWith(
                PrizeDto,
                expect.objectContaining({
                    details: prize.details,
                    order: prize.order,
                    quantity: prize.quantity,
                    createdBy: userDtoMock.id
                })
            );

            expect(entityManagerMock.persist).toHaveBeenCalledTimes(2);
            expect(entityManagerMock.flush).toHaveBeenCalledTimes(1);
        });
    });
});

describe('RafflesService - executeRaffle', () => {
    let service: RafflesService;

    const mockRaffleResponse = {
        ticketNumber: raffleParticipantDtoMock.ticketNumber,
        beneficiary: raffleParticipantDtoMock.beneficiary
    };
    const mockRaffleResult = {
        id: raffleParticipantDtoMock.beneficiary,
        chances: 1
    };
    const mockRaffleCollectibleBeneficiaryType = {
        collectibleId: 'collectibleId',
        beneficiary: raffleParticipantDtoMock.beneficiary
    };

    const mockEntityManager = {};
    const mockLogger = {
        error: jest.fn()
    };
    const mockRaffleDataAccessService = {
        getUserByExternalUserId: jest.fn().mockResolvedValue(userDtoMock),
        getRaffleAndCollectibles: jest.fn().mockResolvedValue({
            raffle: raffleDtoMock,
            raffleLinkedCollectibles: [collectibleRaffleDtoMock]
        }),
        getAvailableRaffleBeneficiaries: jest
            .fn()
            .mockResolvedValue([mockRaffleCollectibleBeneficiaryType]),
        getParticipant: jest.fn().mockResolvedValue(raffleParticipantDtoMock),
        saveRaffleResult: jest.fn()
    };

    const mockRaffleHelpers = {
        checkTheRaffleHasCollectiblesLinked: jest.fn(),
        getScoredBeneficiaries: jest.fn().mockReturnValue([mockRaffleResult]),
        getRandomItemByChance: jest.fn().mockReturnValue(mockRaffleResult)
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RafflesService,
                { provide: EntityManager, useValue: mockEntityManager },
                { provide: CustomLogger, useValue: mockLogger },
                {
                    provide: RaffleDataAccessService,
                    useValue: mockRaffleDataAccessService
                },
                { provide: RaffleHelpers, useValue: mockRaffleHelpers }
            ]
        }).compile();

        service = module.get<RafflesService>(RafflesService);
    });

    it('should execute raffle successfully', async () => {
        const raffleId = raffleDtoMock.id;
        const externalUserId = userDtoMock.externalUserId;

        const result = await service.executeRaffle({
            raffleId,
            externalUserId
        });

        expect(result).toEqual(mockRaffleResponse);
        expect(mockRaffleDataAccessService.getUserByExternalUserId).toHaveBeenCalledWith(
            userDtoMock.externalUserId
        );
        expect(mockRaffleHelpers.checkTheRaffleHasCollectiblesLinked).toHaveBeenCalledWith(
            raffleId
        );
        expect(mockRaffleDataAccessService.getRaffleAndCollectibles).toHaveBeenCalledWith(
            raffleId,
            userDtoMock
        );
        expect(mockRaffleDataAccessService.getAvailableRaffleBeneficiaries).toHaveBeenCalledWith(
            [collectibleRaffleDtoMock.collectibleId.id],
            raffleId
        );
        expect(mockRaffleHelpers.getScoredBeneficiaries).toHaveBeenCalledWith(
            [mockRaffleCollectibleBeneficiaryType],
            raffleDtoMock.useWeight,
            [collectibleRaffleDtoMock]
        );
        expect(mockRaffleHelpers.getRandomItemByChance).toHaveBeenCalledWith([mockRaffleResult]);
        expect(mockRaffleDataAccessService.getParticipant).toHaveBeenCalledWith(
            mockRaffleResult.id,
            raffleDtoMock.event
        );
        expect(mockRaffleDataAccessService.saveRaffleResult).toHaveBeenCalledWith(
            raffleId,
            userDtoMock.id,
            raffleParticipantDtoMock
        );
    });

    it('should execute raffle successfully without weighting', async () => {
        raffleDtoMock.useWeight = false;

        mockRaffleHelpers.getScoredBeneficiaries.mockReturnValue([mockRaffleResult]);

        const result = await service.executeRaffle({
            raffleId: 'testRaffleId',
            externalUserId: 'testUserId'
        });

        expect(result).toEqual(mockRaffleResponse);
    });

    it('should fail if getUserByExternalUserId throws an error', async () => {
        mockRaffleDataAccessService.getUserByExternalUserId.mockImplementation(() => {
            throw new Error('Test error');
        });

        await expect(
            service.executeRaffle({
                raffleId: 'testRaffleId',
                externalUserId: 'testUserId'
            })
        ).rejects.toThrow('Test error');
    });

    it('should log error message if an error is thrown', async () => {
        const testError = new Error('Test error');

        mockRaffleDataAccessService.getUserByExternalUserId.mockImplementation(() => {
            throw testError;
        });

        await expect(
            service.executeRaffle({
                raffleId: 'testRaffleId',
                externalUserId: 'testUserId'
            })
        ).rejects.toThrow(testError);

        expect(mockLogger.error).toHaveBeenCalledWith(`Error when executing raffle testRaffleId`);
    });
});
