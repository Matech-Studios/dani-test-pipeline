import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { EventDto } from 'src/core/dto/event.dto';
import { QuestionnaireAttendeeResponseDto } from 'src/core/dto/questionnaireAttendeeResponse.dto';
import { QuestionnaireQuestionDto } from 'src/core/dto/questionnaireQuestion.dto';
import { UserDto } from 'src/core/dto/user.dto';

@Injectable()
export class QuestionnairesService {
    constructor(private readonly em: EntityManager) {}

    public async deleteByCollectibleId(
        collectibleId: string,
        externalUserId: string
    ): Promise<void> {
        const userDto = await this.em.findOne(UserDto, {
            externalUserId: externalUserId
        });

        const collectibleDto = await this.em.findOne(CollectibleDto, {
            id: collectibleId
        });

        if (userDto === null || collectibleDto === null) {
            return;
        }

        await this.em.nativeDelete(QuestionnaireQuestionDto, {
            collectible: collectibleDto,
            createdBy: userDto.id
        });

        await this.em.flush();
    }

    public async getEventsQuestionnaireResponses(eventId: string, externalUserId: string) {
        const userDto = await this.em.findOne(UserDto, {
            externalUserId: externalUserId
        });

        if (userDto === null) {
            throw new BadRequestException('Invalid user');
        }

        const eventDto = await this.em.findOne(EventDto, {
            id: eventId,
            createdBy: userDto.id
        });

        if (eventDto === null) {
            throw new NotFoundException('Event not found');
        }

        const collectiblesDto = await this.em.find(CollectibleDto, {
            event: eventDto
        });

        const responsesDto = await this.em.find(
            QuestionnaireAttendeeResponseDto,
            {
                collectible: { $in: collectiblesDto }
            },
            {
                orderBy: {
                    collectible: 'ASC',
                    beneficiary: 'ASC',
                    question: 'ASC'
                },
                populate: ['collectible']
            }
        );

        const responses = [];
        let collectibleId = '';

        for (let i = 0; i < responsesDto.length; ) {
            if (collectibleId != responsesDto[i].collectible.id) {
                collectibleId = responsesDto[i].collectible.id;
            }

            const beneficiary = responsesDto[i].beneficiary;

            const response = [];
            response[0] = responsesDto[i].collectible.name;
            response[1] = beneficiary;
            let j = 2;

            while (beneficiary === responsesDto[i]?.beneficiary) {
                response[j++] = responsesDto[i]['question'];
                response[j++] = responsesDto[i]['answer'];

                i++;
            }

            responses.push(response);
        }

        return responses;
    }
}
