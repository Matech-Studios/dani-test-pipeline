import { EntityManager } from '@mikro-orm/core';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CollectibleRaffleDto } from 'src/core/dto';
import { collectibleRaffleListMock } from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { RaffleHelpers } from '../raffles.helper.service';

describe('RaffleHelpers', () => {
    let raffleHelpers: RaffleHelpers;
    let mockEntityManager;
    let customLoggerMock;

    beforeEach(async () => {
        customLoggerMock = { error: jest.fn() };
        mockEntityManager = { count: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RaffleHelpers,
                { provide: EntityManager, useValue: mockEntityManager },
                { provide: CustomLogger, useValue: customLoggerMock }
            ]
        }).compile();

        raffleHelpers = module.get<RaffleHelpers>(RaffleHelpers);
    });

    it('should throw an error if the raffle is already executed', async () => {
        const raffleMock = {
            id: 'raffle1',
            status: 'Executed'
        };
        await expect(raffleHelpers.checkThatTheRaffleIsNotExecuted(raffleMock)).rejects.toThrow(
            ForbiddenException
        );
        expect(customLoggerMock.error).toBeCalledWith('Raffle raffle1 is already executed.');
    });
    it('should not throw an error if the raffle is not yet executed', async () => {
        const raffleMock = {
            id: 'raffle1',
            status: 'Not Executed'
        };
        await expect(
            raffleHelpers.checkThatTheRaffleIsNotExecuted(raffleMock)
        ).resolves.not.toThrow();
    });

    it('should throw an error if there are no claimed collectibles linked', async () => {
        const justCollectiblesIds = ['id1', 'id2'];
        mockEntityManager.count.mockResolvedValue(0);
        await expect(
            raffleHelpers.checkRaffleHasCollectiblesLinkedClaimed(justCollectiblesIds)
        ).rejects.toThrow(NotFoundException);
    });

    it('should not throw an error if there are claimed collectibles linked', async () => {
        const justCollectiblesIds = ['id1', 'id2'];
        mockEntityManager.count.mockResolvedValue(1);
        await expect(
            raffleHelpers.checkRaffleHasCollectiblesLinkedClaimed(justCollectiblesIds)
        ).resolves.not.toThrow();
    });

    describe('checkTheRaffleHasCollectiblesLinked', () => {
        it('should throw a NotFoundException when no collectibles are linked', async () => {
            const raffleId = 'raffle1';
            mockEntityManager.count.mockResolvedValue(0);

            await expect(
                raffleHelpers.checkTheRaffleHasCollectiblesLinked(raffleId)
            ).rejects.toThrowError(NotFoundException);
            expect(mockEntityManager.count).toHaveBeenCalledWith(CollectibleRaffleDto, {
                raffleId: raffleId
            });
            expect(customLoggerMock.error).toHaveBeenCalled();
        });

        it('should not throw an exception when collectibles are linked', async () => {
            const raffleId = 'raffle2';
            mockEntityManager.count.mockResolvedValue(1);

            await expect(
                raffleHelpers.checkTheRaffleHasCollectiblesLinked(raffleId)
            ).resolves.not.toThrow();
            expect(mockEntityManager.count).toHaveBeenCalledWith(CollectibleRaffleDto, {
                raffleId: raffleId
            });
            expect(customLoggerMock.error).not.toHaveBeenCalled();
        });
    });

    describe('checkThatTheRaffleIsNotExecuted', () => {
        it('should not throw an exception when the raffle is not yet executed', () => {
            const raffle = { id: 'raffle2', status: 'Not Executed' };

            expect(() => raffleHelpers.checkThatTheRaffleIsNotExecuted(raffle)).not.toThrow();
            expect(customLoggerMock.error).not.toHaveBeenCalled();
        });
    });

    describe('getScoredBeneficiaries', () => {
        it('should correctly calculate chances when useWeight is false', () => {
            const availableBeneficiaries = [
                { beneficiary: 'Benef1', collectibleId: '1' },
                { beneficiary: 'Benef1', collectibleId: '2' },
                { beneficiary: 'Benef2', collectibleId: '3' }
            ];

            const result = raffleHelpers.getScoredBeneficiaries(
                availableBeneficiaries,
                false,
                collectibleRaffleListMock
            );

            expect(result).toEqual([
                { id: 'Benef1', chances: 2 },
                { id: 'Benef2', chances: 1 }
            ]);
        });

        it('should correctly calculate chances when useWeight is true', () => {
            const availableBeneficiaries = [
                { beneficiary: 'Benef1', collectibleId: '1' },
                { beneficiary: 'Benef1', collectibleId: '2' },
                { beneficiary: 'Benef2', collectibleId: '3' }
            ];

            const result = raffleHelpers.getScoredBeneficiaries(
                availableBeneficiaries,
                true,
                collectibleRaffleListMock
            );

            expect(result).toEqual([
                { id: 'Benef1', chances: 3 },
                { id: 'Benef2', chances: 5 }
            ]);
        });
    });

    describe('getRandomItemByChance', () => {
        it('should return a random item based on their chances', () => {
            const eligibleEntries = [
                { id: 'e1', chances: 1 },
                { id: 'e2', chances: 3 }
            ];

            const result = raffleHelpers.getRandomItemByChance(eligibleEntries);

            expect(result.id).toEqual(expect.stringMatching(/e1|e2/));
        });
    });

    describe('removeSelectedItem', () => {
        it('should remove the selected item from the entries', () => {
            const remainingEntries = [
                { id: 'e1', chances: 1 },
                { id: 'e2', chances: 3 }
            ];
            const selectedItem = { id: 'e1', chances: 1 };

            const result = raffleHelpers.removeSelectedItem(remainingEntries, selectedItem);

            expect(result).toEqual([{ id: 'e2', chances: 3 }]);
        });
    });

    describe('getEntriesWithChances', () => {
        it('should return an array of entries repeated based on their chances', () => {
            const entry = { id: 'e1', chances: 3 };

            const result = raffleHelpers.getEntriesWithChances(entry);

            expect(result).toEqual([
                { id: 'e1', chances: 3 },
                { id: 'e1', chances: 3 },
                { id: 'e1', chances: 3 }
            ]);
        });
    });

    describe('createExtendedArray', () => {
        it('should create an extended array based on chances', () => {
            const remainingEntries = [
                { id: 'e1', chances: 2 },
                { id: 'e2', chances: 1 }
            ];

            const result = raffleHelpers.createExtendedArray(remainingEntries);

            expect(result).toEqual([
                { id: 'e1', chances: 2 },
                { id: 'e1', chances: 2 },
                { id: 'e2', chances: 1 }
            ]);
        });
    });
});
