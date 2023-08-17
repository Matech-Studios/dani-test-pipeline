import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import {
    EventRafflesResponse,
    EventResponse,
    ExternalPoapResponse,
    UserResponse
} from 'src/core/contracts';
import { EventDto } from 'src/core/dto/event.dto';
import {
    CreateEventEntity,
    EditEventEntity,
    EventEntity,
    SubmitExternalPoapsEntity
} from 'src/core/entities';
import { CustomLogger } from 'src/core/utils';
import { getDateAtMidnight } from 'src/core/utils/dateHelper.util';
import { UsersService } from 'src/modules/users';
import { CollectiblesService } from '../collectibles/collectibles.service';
import { CollectibleRaffleDto } from './../../core/dto/collectibleRaffle.dto';

@Injectable()
export class EventsService {
    constructor(
        private readonly em: EntityManager,
        private readonly userService: UsersService,
        private readonly collectiblesService: CollectiblesService,
        private logger: CustomLogger
    ) {}

    public async create(createEventEntity: CreateEventEntity): Promise<string> {
        try {
            this.validateStartDate(createEventEntity.startDate);

            const user: UserResponse = await this.userService.findOneByExternalId(
                createEventEntity.externalUserId
            );

            const eventDto = this.em.create(EventDto, {
                ...createEventEntity,
                companyId: user.company.id,
                createdBy: user.id
            });

            await this.em.persistAndFlush(eventDto);

            return eventDto.id;
        } catch (error) {
            this.logger.log(`create method: ${error}`, EventsService.name);
            throw error;
        }
    }

    public async edit(editEventEntity: EditEventEntity): Promise<EventEntity> {
        try {
            this.validateStartDate(editEventEntity.startDate);

            const user: UserResponse = await this.userService.findOneByExternalId(
                editEventEntity.externalUserId
            );

            const event = await this.em.findOneOrFail(EventDto, editEventEntity.id);

            this.em.assign(event, {
                ...editEventEntity,
                updatedBy: user.id,
                updatedAt: Date.now()
            });

            await this.em.flush();

            return event;
        } catch (error) {
            this.logger.log(`edit method: ${error}`, EventsService.name);
            throw error;
        }
    }

    public async find(externalUserId: string): Promise<EventEntity[]> {
        try {
            const user: UserResponse = await this.userService.findOneByExternalId(externalUserId);

            const eventsDto: EventDto[] = await this.em.find(EventDto, {
                createdBy: user.id
            });

            return eventsDto.map(event => {
                const eventLocation = event.virtual ? null : `${event.city} - ${event.country}`;

                return {
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    city: event.city,
                    country: event.country,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    poapsQuantity: event.poapsQuantity,
                    createdBy: event.createdBy,
                    createdAt: event.createdAt,
                    virtual: event.virtual,
                    location: eventLocation,
                    attendees: event.attendees
                };
            });
        } catch (error) {
            this.logger.log(`Find method: ${error}`, EventsService.name);
            throw error;
        }
    }

    public async findById(id: string, externalUserId: string): Promise<EventResponse> {
        const { AWS_BASE_URL } = process.env;

        try {
            const user: UserResponse = await this.userService.findOneByExternalId(externalUserId);

            if (!user) {
                throw new HttpException(
                    `User not found: ${externalUserId}`,
                    HttpStatusCode.NotFound
                );
            }

            const eventDto: EventDto = await this.em.findOneOrFail(
                EventDto,
                {
                    id,
                    createdBy: user.id
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

            if (!eventDto) {
                throw new HttpException(`Event not found: ${id}`, HttpStatus.NOT_FOUND);
            }

            const eventResponse = new EventResponse({
                ...eventDto,
                collectibles: [],
                raffles: []
            });

            if (eventDto.collectibles?.length) {
                eventResponse.collectibles = eventDto.collectibles.toArray().map(collectible => ({
                    ...collectible,
                    image: collectible.image ? `${AWS_BASE_URL || ''}${collectible.image}` : null,
                    eventId: eventDto.id,
                    containsQuestions: collectible.questions?.length > 0
                }));
            }

            if (eventDto.raffles?.length) {
                eventResponse.raffles = await Promise.all(
                    eventDto.raffles.toArray().map(async raffle => ({
                        ...raffle,
                        linkedCollectibles: await this.em.find(
                            CollectibleRaffleDto,
                            {
                                raffleId: raffle.id
                            },
                            {
                                populate: ['collectibleId']
                            }
                        )
                    }))
                );
            }

            return eventResponse;
        } catch (error) {
            this.logger.error(`findById method: ${error}`, EventsService.name);
            throw error;
        }
    }

    public async submitExternalPoaps(
        submitExternalPoapsEntity: SubmitExternalPoapsEntity
    ): Promise<ExternalPoapResponse[]> {
        try {
            const user: UserResponse = await this.userService.findOneByExternalId(
                submitExternalPoapsEntity.createdBy
            );

            if (!user) {
                throw new HttpException(
                    `User not found: ${submitExternalPoapsEntity.createdBy}`,
                    HttpStatusCode.NotFound
                );
            }

            const eventDto: EventDto = await this.em.findOneOrFail(
                EventDto,
                {
                    id: submitExternalPoapsEntity.eventId,
                    createdBy: user.id
                },
                {
                    populate: ['collectibles']
                }
            );

            if (!eventDto) {
                throw new HttpException(
                    `Event not found: ${submitExternalPoapsEntity.eventId}`,
                    HttpStatus.NOT_FOUND
                );
            }

            const response: ExternalPoapResponse[] = [];
            let overallSuccess = false;

            for (let i = 0; i < eventDto.collectibles?.length; i++) {
                if (eventDto.collectibles[i].secretCode === null) {
                    try {
                        const submitResponse = await this.collectiblesService.submitPoap(
                            {
                                ...eventDto.collectibles[i],
                                questions: null
                            },
                            eventDto,
                            eventDto.collectibles[i].image
                        );

                        if (submitResponse.success) {
                            eventDto.collectibles[i].secretCode = submitResponse.secretCode;
                            eventDto.collectibles[i].externalPoapId = submitResponse.poapId;

                            overallSuccess = true;
                            response.push({
                                collectibleId: eventDto.collectibles[i].id,
                                success: true
                            });
                        } else {
                            response.push({
                                collectibleId: eventDto.collectibles[i].id,
                                success: false,
                                error: submitResponse.error
                            });
                        }
                    } catch (error) {
                        response.push({
                            collectibleId: eventDto.collectibles[i].id,
                            success: false,
                            error
                        });
                    }
                }
            }

            if (overallSuccess) {
                this.em.flush();
            }

            return response;
        } catch (error) {
            this.logger.error(`submitExternalPoaps method: ${error}`, EventsService.name);
            throw error;
        }
    }

    public async getRaffles(
        eventId: string,
        externalUserId: string
    ): Promise<EventRafflesResponse[]> {
        try {
            const user: UserResponse = await this.userService.findOneByExternalId(externalUserId);

            if (!user) {
                throw new HttpException(
                    `User not found: ${externalUserId}`,
                    HttpStatusCode.NotFound
                );
            }

            const eventDto: EventDto = await this.em.findOneOrFail(
                EventDto,
                {
                    id: eventId,
                    createdBy: user.id
                },
                {
                    populate: [
                        'raffles',
                        'raffles.prizes',
                        'raffles.winners',
                        'raffles.winners.raffleParticipant'
                    ],
                    fields: [
                        'raffles.*',
                        'raffles.prizes',
                        'raffles.winners.beneficiary',
                        'raffles.winners.raffleParticipant'
                    ]
                }
            );

            if (!eventDto) {
                throw new HttpException(`Event not found: ${eventId}`, HttpStatus.NOT_FOUND);
            }

            return await Promise.all(
                eventDto.raffles.getItems().map(async raffle => {
                    return {
                        id: raffle.id,
                        key: raffle.key,
                        name: raffle.name,
                        useWeight: raffle.useWeight,
                        status: raffle.status,
                        prizes: raffle.prizes.getItems().map(prize => {
                            return {
                                id: prize.id,
                                order: prize.order,
                                details: prize.details,
                                quantity: prize.quantity
                            };
                        }),
                        winners: raffle.winners?.getItems().map(winner => {
                            return {
                                beneficiary: winner.beneficiary,
                                ticketNumber: winner.raffleParticipant?.ticketNumber
                            };
                        }),
                        linkedCollectibles: await this.em.find(
                            CollectibleRaffleDto,
                            {
                                raffleId: raffle.id
                            },
                            {
                                populate: ['collectibleId']
                            }
                        )
                    };
                })
            );
        } catch (error) {
            this.logger.error(`findById method: ${error}`, EventsService.name);
            throw error;
        }
    }

    private validateStartDate(startDate: number) {
        const nowAtMidnight = getDateAtMidnight(Date.now());
        const startDateAtMidnight = getDateAtMidnight(startDate);

        if (nowAtMidnight > startDateAtMidnight) {
            throw new BadRequestException('Start date cannot be set before today');
        }
    }
}
