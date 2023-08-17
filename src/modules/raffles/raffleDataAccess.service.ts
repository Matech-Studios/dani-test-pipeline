import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
    CollectibleRaffleDto,
    EventDto,
    QuestionnaireAttendeeResponseDto,
    RaffleDto,
    RaffleWinnersDto,
    RafflesParticipantsDto,
    UserDto
} from 'src/core/dto';
import { IRaffleCollectibleBeneficiary } from 'src/core/interfaces';

@Injectable()
export class RaffleDataAccessService {
    constructor(private readonly em: EntityManager) {}

    public async getRaffleAndCollectibles(raffleId: string, createdByUser: UserDto) {
        const raffle = await this.em.findOne(
            RaffleDto,
            { id: raffleId, createdBy: createdByUser.id },
            {
                populate: ['prizes', 'winners', 'event']
            }
        );

        const raffleLinkedCollectibles = await this.em.find(
            CollectibleRaffleDto,
            { raffleId: raffleId },
            {
                populate: ['collectibleId']
            }
        );
        return { raffle, raffleLinkedCollectibles };
    }

    public async getUserByExternalUserId(externalUserId: string): Promise<UserDto> {
        return await this.em.findOne(UserDto, {
            externalUserId
        });
    }

    public async getParticipant(beneficiary: string, event: EventDto) {
        const raffleParticipant = await this.em.findOne(RafflesParticipantsDto, {
            beneficiary,
            event
        });
        if (!raffleParticipant) {
            throw new BadRequestException(
                ' There are no ticket numbers related to the beneficiary.'
            );
        }
        return raffleParticipant;
    }

    public async getAvailableRaffleBeneficiaries(
        raffleLinkedCollectiblesIds: string[],
        raffleId: string
    ): Promise<IRaffleCollectibleBeneficiary[]> {
        const beneficiariesThatAlreadyWon = await this.em.find(RaffleWinnersDto, {
            raffle: raffleId
        });
        const beneficiariesThatAlreadyWonIds = beneficiariesThatAlreadyWon.map(
            raffleWinner => raffleWinner.beneficiary
        );

        const questionnaireResponses = await this.em.find(QuestionnaireAttendeeResponseDto, {
            collectible: { $in: [...raffleLinkedCollectiblesIds] }
        });
        const questionnaireResponsesBeneficiaries = questionnaireResponses.map(response => {
            return {
                collectibleId: response.collectible.id,
                beneficiary: response.beneficiary
            };
        });

        const distinctSet = new Set<string>();
        const distinctCollectiblesBeneficiariesList: IRaffleCollectibleBeneficiary[] = [];

        questionnaireResponsesBeneficiaries.forEach(response => {
            const { collectibleId, beneficiary } = response;
            const key = `${collectibleId}-${beneficiary}`;

            if (!distinctSet.has(key)) {
                distinctSet.add(key);
                distinctCollectiblesBeneficiariesList.push({
                    collectibleId,
                    beneficiary
                });
            }
        });

        const availableBeneficiaries = distinctCollectiblesBeneficiariesList.filter(
            x => !beneficiariesThatAlreadyWonIds.includes(x.beneficiary)
        );

        if (availableBeneficiaries.length === 0) {
            throw new BadRequestException(' There are no beneficiaries left');
        }

        return availableBeneficiaries;
    }

    public async saveRaffleResult(
        raffleId: string,
        createdByUserId: string,
        raffleParticipant: RafflesParticipantsDto
    ) {
        const raffleWinner = this.em.create(RaffleWinnersDto, {
            raffle: raffleId,
            beneficiary: raffleParticipant.beneficiary,
            createdBy: createdByUserId,
            raffleParticipant: raffleParticipant
        });
        this.em.persist(raffleWinner);
        await this.em.flush();
    }
}
