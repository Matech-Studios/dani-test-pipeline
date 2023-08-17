import { EntityManager } from '@mikro-orm/core';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CollectibleRaffleDto } from 'src/core/dto/collectibleRaffle.dto';
import { MintLinkDto } from 'src/core/dto/mintLink.dto';
import { IRaffleCollectibleBeneficiary, IRaffleResult } from 'src/core/interfaces';
import { CustomLogger } from 'src/core/utils';

const STATUS = {
    Executed: 'Executed',
    NotExecuted: 'Not Executed'
};

@Injectable()
export class RaffleHelpers {
    constructor(
        private readonly em: EntityManager,
        private logger: CustomLogger
    ) {}

    public async checkTheRaffleHasCollectiblesLinked(raffleId: string) {
        if (
            (await this.em.count(CollectibleRaffleDto, {
                raffleId: raffleId
            })) <= 0
        ) {
            const message = 'You need at least one collectible linked to this raffle to execute it';
            this.logger.error(message);
            throw new NotFoundException(`${message}. RaffleId : ${raffleId}`);
        }
    }

    public async checkThatTheRaffleIsNotExecuted(raffle) {
        if (raffle.status === STATUS.Executed) {
            this.logger.error(`Raffle ${raffle.id} is already executed.`);
            throw new ForbiddenException('Raffle is already executed.');
        }
    }

    public async checkRaffleHasCollectiblesLinkedClaimed(justCollectiblesIds: string[]) {
        if (
            (await this.em.count(MintLinkDto, {
                collectible: { $in: [...justCollectiblesIds] },
                claimed: true
            })) <= 0
        ) {
            throw new NotFoundException(
                'You need at least one collectible linked to this raffle to be claimed to execute the raffle.'
            );
        }
    }

    public getScoredBeneficiaries(
        availableBeneficiaries: IRaffleCollectibleBeneficiary[],
        useWeight: boolean,
        raffleLinkedCollectibles: CollectibleRaffleDto[]
    ): IRaffleResult[] {
        const sumByChancesMap = new Map<string, number>();

        for (const response of availableBeneficiaries) {
            const chances = useWeight
                ? raffleLinkedCollectibles.find(
                      raffleCollectible =>
                          raffleCollectible.collectibleId.id === response.collectibleId
                  ).score
                : 1;

            sumByChancesMap.set(
                response.beneficiary,
                (sumByChancesMap.get(response.beneficiary) ?? 0) + chances
            );
        }

        const summedData: IRaffleResult[] = Array.from(sumByChancesMap, ([id, chances]) => ({
            id,
            chances
        }));

        return summedData;
    }

    public getRandomItemByChance(eligibleEntries) {
        const extendedArray = this.createExtendedArray(eligibleEntries);
        // raffle magic!
        const randomIndex = Math.floor(Math.random() * extendedArray.length);
        // select the winner...
        return extendedArray[randomIndex];
    }

    // Helper method to remove the selected item from the remaining entries
    removeSelectedItem(remainingEntries, selectedItem) {
        return remainingEntries.filter(entry => entry.id !== selectedItem.id);
    }

    // Helper method to get an array of entries repeated based on their chances
    getEntriesWithChances(entry) {
        return new Array(entry.chances).fill(entry);
    }

    // Helper method to create an extended array based on chances
    createExtendedArray(remainingEntries) {
        const extendedArray = [];

        remainingEntries.forEach(entry => {
            const entriesWithChances = this.getEntriesWithChances(entry);
            extendedArray.push(...entriesWithChances);
        });

        return extendedArray;
    }
}
