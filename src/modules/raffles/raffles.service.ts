import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RaffleResponse } from 'src/core/contracts/responses/raffleResponse.response';
import { CollectibleRaffleDto } from 'src/core/dto';
import { EventDto } from 'src/core/dto/event.dto';
import { PrizeDto } from 'src/core/dto/prize.dto';
import { RaffleDto } from 'src/core/dto/raffle.dto';
import { UserDto } from 'src/core/dto/user.dto';
import { CreateRafflesEntity, ExecuteRaffleEntity } from 'src/core/entities/createRaffles.entity';
import { CustomLogger } from 'src/core/utils';
import { RaffleDataAccessService } from 'src/modules/raffles/raffleDataAccess.service';
import { RaffleHelpers } from './raffles.helper.service';

type RaffleResultType = {
    id: string;
    chances: number;
};

@Injectable()
export class RafflesService {
    constructor(
        private readonly em: EntityManager,
        private logger: CustomLogger,
        private raffleDataAccessService: RaffleDataAccessService,
        private raffleHelpers: RaffleHelpers
    ) {}

    public async upsert(createRafflesEntity: CreateRafflesEntity): Promise<void> {
        try {
            const createdByUser = await this.em.findOne(UserDto, {
                externalUserId: createRafflesEntity.externalUserId
            });

            if (!createdByUser) {
                throw new BadRequestException(
                    `Invalid user: ${createRafflesEntity.externalUserId}`
                );
            }

            const eventDto = await this.em.findOne(EventDto, {
                id: createRafflesEntity.eventId,
                createdBy: createdByUser.id
            });

            if (!eventDto) {
                throw new BadRequestException(
                    `Event does not exist: ${createRafflesEntity.eventId}`
                );
            }

            const eventRaffles = await this.em.find(RaffleDto, {
                event: eventDto
            });

            eventRaffles.forEach(raffle => {
                if (createRafflesEntity.raffles.find(r => r.id === raffle.id) === undefined) {
                    this.em.remove(raffle);
                }
            });

            for (const raffleEntity of createRafflesEntity.raffles) {
                const existingRaffle = await this.em.findOne(
                    RaffleDto,
                    {
                        id: raffleEntity.id,
                        createdBy: createdByUser.id
                    },
                    {
                        populate: ['prizes'],
                        fields: ['*', 'prizes.*']
                    }
                );

                if (raffleEntity.id === null || existingRaffle === null) {
                    const newRaffleDto = this.em.create(RaffleDto, {
                        name: raffleEntity.name,
                        key: raffleEntity.key,
                        useWeight: raffleEntity.useWeight,
                        event: eventDto,
                        createdBy: createdByUser.id
                    });

                    this.em.persist(newRaffleDto);

                    raffleEntity.prizes.forEach(prize => {
                        const newPrizeDto = this.em.create(PrizeDto, {
                            details: prize.details,
                            order: prize.order,
                            quantity: Number(prize.quantity),
                            createdBy: createdByUser.id,
                            raffle: newRaffleDto
                        });

                        this.em.persist(newPrizeDto);
                    });
                } else {
                    existingRaffle.prizes.getItems().forEach(prize => this.em.remove(prize));

                    raffleEntity.prizes.forEach(prize => {
                        const newPrizeDto = this.em.create(PrizeDto, {
                            details: prize.details,
                            order: prize.order,
                            quantity: Number(prize.quantity),
                            createdBy: createdByUser.id,
                            raffle: existingRaffle
                        });

                        this.em.persist(newPrizeDto);
                    });

                    this.em.assign(existingRaffle, {
                        name: raffleEntity.name,
                        useWeight: raffleEntity.useWeight
                    });
                }
            }

            await this.em.flush();
        } catch (error) {
            this.logger.error(`Error when creating raffles or prizes: ${error}`);

            if (error?.name == 'UniqueConstraintViolationException') {
                throw new BadRequestException('Raffle exists or repeated prizes already exists');
            }

            throw error;
        }
    }

    public async executeRaffle({
        raffleId,
        externalUserId
    }: ExecuteRaffleEntity): Promise<RaffleResponse> {
        try {
            const createdByUser: UserDto =
                await this.raffleDataAccessService.getUserByExternalUserId(externalUserId);

            await this.raffleHelpers.checkTheRaffleHasCollectiblesLinked(raffleId);

            const {
                raffle,
                raffleLinkedCollectibles
            }: {
                raffle: RaffleDto;
                raffleLinkedCollectibles: CollectibleRaffleDto[];
            } = await this.raffleDataAccessService.getRaffleAndCollectibles(
                raffleId,
                createdByUser
            );

            // get just the ids for collectibles that are going to be participating.
            const collectiblesIds = raffleLinkedCollectibles.map(
                (raffleCollectible: CollectibleRaffleDto) => raffleCollectible.collectibleId.id
            );

            const availableBeneficiaries =
                await this.raffleDataAccessService.getAvailableRaffleBeneficiaries(
                    collectiblesIds,
                    raffle.id
                );

            // get a list of the beneficiaries and their chance to win the raffle depending on the
            // score that we give on the link collectible raffle section.
            const scoredBeneficiaries = this.raffleHelpers.getScoredBeneficiaries(
                availableBeneficiaries,
                raffle.useWeight,
                raffleLinkedCollectibles
            );

            const raffleResult: RaffleResultType =
                this.raffleHelpers.getRandomItemByChance(scoredBeneficiaries);

            const raffleParticipant = await this.raffleDataAccessService.getParticipant(
                raffleResult.id,
                raffle.event
            );

            this.raffleDataAccessService.saveRaffleResult(
                raffle.id,
                createdByUser.id,
                raffleParticipant
            );

            const { ticketNumber } = raffleParticipant;

            return { ticketNumber: ticketNumber, beneficiary: raffleResult.id };
        } catch (error) {
            this.logger.error(`Error when executing raffle ${raffleId}`);
            throw error;
        }
    }
}
