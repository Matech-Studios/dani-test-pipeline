import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AttendeeQuestionnaireResponse, PublicEventResponse } from 'src/core/contracts';
import { EventDto } from 'src/core/dto/event.dto';
import { RafflesParticipantsDto } from 'src/core/dto/rafflesParticipants.dto';
import { CustomLogger } from 'src/core/utils';

@Injectable()
export class PublicService {
    constructor(private readonly em: EntityManager, private logger: CustomLogger) {}

    public async findEventById(id: string): Promise<PublicEventResponse> {
        const eventDto: EventDto = await this.em.findOneOrFail(
            EventDto,
            {
                id
            },
            {
                fields: [
                    'city',
                    'country',
                    'description',
                    'endDate',
                    'name',
                    'startDate',
                    'multiDay',
                    'virtual'
                ]
            }
        );

        if (!eventDto) {
            throw new HttpException(`Event not found: ${id}`, HttpStatus.NOT_FOUND);
        }

        const eventLocation = eventDto.virtual
            ? 'Virtual'
            : `${eventDto.city} - ${eventDto.country}`;

        return new PublicEventResponse({
            description: eventDto.description,
            location: eventLocation,
            name: eventDto.name,
            startDate: eventDto.startDate,
            endDate: eventDto.multiDay ? eventDto.endDate : eventDto.startDate
        });
    }

    public async findParticipantTicketNumber(
        eventId: string,
        beneficiary: string
    ): Promise<AttendeeQuestionnaireResponse> {
        try {
            const raffleParticipant = await this.em.findOne(RafflesParticipantsDto, {
                beneficiary: beneficiary,
                event: eventId
            });

            if (raffleParticipant === null) {
                throw new BadRequestException(
                    'Please complete a questionnaire in order to participate'
                );
            }

            return {
                beneficiary: raffleParticipant.beneficiary,
                ticketNumber: raffleParticipant.ticketNumber,
                eventId: raffleParticipant.event.id
            };
        } catch (error) {
            this.logger.error(
                `Error getting participant ticket number: ${error}`,
                PublicService.name
            );

            throw error;
        }
    }
}
