import { EntityManager, QueryOrder } from '@mikro-orm/core';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException
} from '@nestjs/common';
import {
    AttendeeQuestionnaireResponse,
    CollectibleQuestionnaireResponse,
    CollectibleRaffleResponse,
    ExternalPoapRequest,
    ExternalPoapResponse,
    MintLinkResponse,
    UpsertCollectibleResponse
} from 'src/core/contracts';
import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { CollectibleRaffleDto } from 'src/core/dto/collectibleRaffle.dto';
import { EventDto } from 'src/core/dto/event.dto';
import { MintLinkDto } from 'src/core/dto/mintLink.dto';
import { QuestionnaireAttendeeResponseDto } from 'src/core/dto/questionnaireAttendeeResponse.dto';
import { RaffleDto } from 'src/core/dto/raffle.dto';
import { RafflesParticipantsDto } from 'src/core/dto/rafflesParticipants.dto';
import { UserDto } from 'src/core/dto/user.dto';
import { PostAttendeeQuestionnaireResponseEntity } from 'src/core/entities';
import {
    CollectibleEntity,
    GetCollectibleEntity,
    LinkCollectibleToRaffleEntity,
    UpdateCollectibleEntity
} from 'src/core/entities/collectible.entity';
import { CustomLogger } from 'src/core/utils';
import {
    addDays,
    fromMillisecondsToPoapDate,
    getDateAtMidnight
} from 'src/core/utils/dateHelper.util';
import { random } from 'src/core/utils/numberHelper.util';
import { S3ManagerService } from 'src/modules/s3';
import { ExternalPoapService } from '../external-poap/external-poap.service';
import { QuestionnairesService } from '../questionnaires';

@Injectable()
export class CollectiblesService {
    private readonly allowedMimeTypes: string[] = ['image/png', 'image/gif'];
    private readonly answersSeparator = '|.|';

    constructor(
        private readonly em: EntityManager,
        private readonly questionnaireService: QuestionnairesService,
        private logger: CustomLogger,
        private readonly externalPoapService: ExternalPoapService,
        private readonly s3Service: S3ManagerService
    ) {}

    public async create(
        createCollectibleEntity: CollectibleEntity
    ): Promise<UpsertCollectibleResponse> {
        const { AWS_BUCKET } = process.env;

        try {
            const userDto = await this.em.findOne(UserDto, {
                externalUserId: createCollectibleEntity.createdBy
            });

            if (!userDto) {
                throw new BadRequestException(`Invalid user: ${createCollectibleEntity.createdBy}`);
            }

            const event = await this.em.findOne(EventDto, {
                id: createCollectibleEntity.eventId,
                createdBy: userDto.id
            });

            if (!event) {
                throw new BadRequestException(
                    `Event does not exist: ${createCollectibleEntity.eventId}`
                );
            }

            createCollectibleEntity.questions?.forEach(question => {
                question.createdBy = userDto.id;

                question.answers?.forEach(answer => {
                    answer.createdBy = userDto.id;
                });
            });

            const collectible = this.em.create(CollectibleDto, {
                ...createCollectibleEntity,
                attendees: createCollectibleEntity.attendees,
                event: event,
                createdBy: userDto.id,
                image: null
            });

            await this.em.persistAndFlush(collectible);

            const imagePath = await this.uploadImage(
                createCollectibleEntity,
                userDto.company.id,
                collectible,
                AWS_BUCKET
            );
            let poapResult: ExternalPoapResponse = null;

            if (
                createCollectibleEntity.submitExternal === true ||
                JSON.parse(createCollectibleEntity.submitExternal?.toString() || 'false')
            ) {
                poapResult = await this.submitPoap(createCollectibleEntity, event, imagePath);

                if (poapResult.success === true) {
                    collectible.poapStatus = 'Submitted';
                }
            }

            collectible.image = imagePath;
            collectible.externalPoapId = poapResult?.poapId;
            collectible.secretCode = poapResult?.secretCode;

            await this.em.flush();

            return {
                id: collectible.id,
                name: collectible.name,
                image: collectible.fullImagePath ?? '',
                attendees: collectible.attendees,
                description: collectible.description,
                event: collectible.event,
                externalPoapId: collectible.externalPoapId,
                website: collectible.website,
                questions: collectible.questions ? collectible.questions?.getItems() : [],
                externalPoapError: poapResult?.success === false ? poapResult.error : null
            };
        } catch (error) {
            this.logger.error(`Error creating a collectible: ${error}`, CollectiblesService.name);

            if (error?.name == 'UniqueConstraintViolationException') {
                throw new BadRequestException('Collectible already exists');
            }

            throw error;
        }
    }

    public async getById(collectibleEntity: GetCollectibleEntity) {
        const { AWS_BASE_URL } = process.env;

        try {
            const createdByUser = await this.em.findOne(UserDto, {
                externalUserId: collectibleEntity.createdBy
            });

            if (!createdByUser) {
                throw new BadRequestException(`Invalid user: ${collectibleEntity.createdBy}`);
            }

            const collectible = await this.em.findOne(
                CollectibleDto,
                {
                    id: collectibleEntity.collectibleId,
                    createdBy: createdByUser.id
                },
                {
                    populate: [
                        'createdBy',
                        'updatedBy',
                        'event',
                        'questions',
                        'questions.answers',
                        'poapStatus'
                    ]
                }
            );

            if (!collectible) {
                throw new NotFoundException(
                    `Collectible not found: ${collectibleEntity.collectibleId}`
                );
            }

            if (collectible?.image) collectible.image = `${AWS_BASE_URL || ''}${collectible.image}`;
            return {
                ...collectible
            };
        } catch (error) {
            this.logger.error(
                `Error when getting collectible ${collectibleEntity.collectibleId}`,
                CollectiblesService.name
            );
            throw error;
        }
    }

    public async updateById(
        updateCollectibleEntity: UpdateCollectibleEntity
    ): Promise<UpsertCollectibleResponse> {
        const { AWS_BASE_URL, AWS_BUCKET } = process.env;

        try {
            const userDto = await this.getUser(updateCollectibleEntity.updatedBy);

            const collectible = await this.em.findOne(
                CollectibleDto,
                {
                    id: updateCollectibleEntity.id,
                    createdBy: userDto.id
                },
                {
                    fields: [
                        'event.id',
                        'event.startDate',
                        'event.multiDay',
                        'event.endDate',
                        'event.city',
                        'event.country',
                        'event.description',
                        'event.name',
                        'event.virtual',
                        'questions'
                    ]
                }
            );

            if (!collectible) {
                throw new NotFoundException('Collectible not found');
            }

            await this.questionnaireService.deleteByCollectibleId(
                updateCollectibleEntity.id,
                userDto.externalUserId
            );

            updateCollectibleEntity.questions?.forEach(question => {
                question.createdBy = userDto.id;

                question.answers?.forEach(answer => {
                    answer.createdBy = userDto.id;
                });
            });

            let imagePath = await this.uploadImage(
                updateCollectibleEntity,
                userDto.company.id,
                collectible,
                AWS_BUCKET
            );

            if (
                imagePath === null &&
                typeof updateCollectibleEntity?.image === 'string' &&
                updateCollectibleEntity?.image !== ''
            ) {
                imagePath = updateCollectibleEntity?.image?.replaceAll(`${AWS_BASE_URL}`, '');
            }

            let poapResult: ExternalPoapResponse = null;
            if (
                (updateCollectibleEntity.submitExternal === true ||
                    JSON.parse(updateCollectibleEntity.submitExternal?.toString() || 'false') ===
                        true) &&
                collectible.secretCode === undefined
            ) {
                poapResult = await this.submitPoap(
                    updateCollectibleEntity,
                    collectible.event,
                    imagePath
                );

                if (poapResult.success === true) {
                    collectible.poapStatus = 'Submitted';
                }
            }

            this.em.assign(collectible, {
                ...updateCollectibleEntity,
                updatedBy: userDto.id,
                image: imagePath,
                externalPoapId: poapResult?.poapId || collectible.externalPoapId,
                secretCode: poapResult?.secretCode || collectible.secretCode,
                questions: updateCollectibleEntity.questions
            });

            await this.em.flush();

            return {
                id: collectible.id,
                name: collectible.name,
                image: imagePath != null ? `${AWS_BASE_URL}${imagePath}` : '',
                attendees: collectible.attendees,
                description: collectible.description,
                event: collectible.event,
                externalPoapId: collectible.externalPoapId,
                website: collectible.website,
                questions: collectible.questions ? collectible.questions?.getItems() : [],
                externalPoapError: poapResult?.success === false ? poapResult.error : null
            };
        } catch (error) {
            this.logger.error(
                `Error updating collectible ${updateCollectibleEntity.id}: ${error}`,
                CollectiblesService.name
            );

            if (error.name == 'UniqueConstraintViolationException') {
                throw new UnprocessableEntityException('This collectible already exists');
            }

            throw error;
        }
    }

    public async linkToRaffle(linkCollectibleToRaffleEntity: LinkCollectibleToRaffleEntity) {
        try {
            const createdBy = await this.em.findOne(UserDto, {
                externalUserId: linkCollectibleToRaffleEntity.createdBy
            });

            if (!createdBy) {
                throw new BadRequestException(
                    `Invalid user: ${linkCollectibleToRaffleEntity.createdBy}`
                );
            }

            const collectible = await this.em.findOne(CollectibleDto, {
                id: linkCollectibleToRaffleEntity.collectibleId,
                createdBy: createdBy.id
            });

            if (!collectible) {
                throw new NotFoundException('Collectible not found');
            }

            const raffle = await this.em.findOne(RaffleDto, {
                id: linkCollectibleToRaffleEntity.raffleId,
                createdBy: createdBy.id
            });

            if (!raffle) {
                throw new NotFoundException('Raffle not found');
            }

            if (collectible.event.id !== raffle.event.id) {
                throw new BadRequestException(
                    "Collectible and Raffle don't belong to the same event"
                );
            }

            const collectibleRaffle = this.em.create(CollectibleRaffleDto, {
                ...linkCollectibleToRaffleEntity,
                createdBy: createdBy.id
            });

            await this.em.persistAndFlush(collectibleRaffle);

            return {
                id: collectibleRaffle.id
            };
        } catch (error) {
            this.logger.error(
                `Error linking raffle to collectible: ${error}`,
                CollectiblesService.name
            );

            if (error?.name == 'UniqueConstraintViolationException') {
                throw new BadRequestException('Raffle already linked');
            }

            throw error;
        }
    }

    public async unlinkRaffle(linkCollectibleToRaffleEntity: LinkCollectibleToRaffleEntity) {
        try {
            const createdBy = await this.em.findOne(UserDto, {
                externalUserId: linkCollectibleToRaffleEntity.createdBy
            });

            if (!createdBy) {
                throw new BadRequestException(
                    `Invalid user: ${linkCollectibleToRaffleEntity.createdBy}`
                );
            }

            const collectible = await this.em.findOne(CollectibleDto, {
                id: linkCollectibleToRaffleEntity.collectibleId,
                createdBy: createdBy.id
            });

            if (!collectible) {
                throw new NotFoundException('Collectible not found');
            }

            const raffle = await this.em.findOne(RaffleDto, {
                id: linkCollectibleToRaffleEntity.raffleId,
                createdBy: createdBy.id
            });

            if (!raffle) {
                throw new NotFoundException('Raffle not found');
            }

            if (collectible.event.id !== raffle.event.id) {
                throw new BadRequestException(
                    "Collectible and Raffle don't belong to the same event"
                );
            }

            const relation = await this.em.findOne(CollectibleRaffleDto, {
                raffleId: raffle.id,
                collectibleId: collectible.id
            });

            this.em.remove(relation);

            await this.em.flush();

            return {
                message: `Raffle ${raffle.id} unlinked`
            };
        } catch (error) {
            this.logger.error(
                `Error unlinking raffle to collectible: ${error}`,
                CollectiblesService.name
            );

            if (error?.name == 'UniqueConstraintViolationException') {
                throw new BadRequestException('Raffle already unlinked');
            }

            throw error;
        }
    }

    public async getRaffles(
        linkCollectibleToRaffleEntity: LinkCollectibleToRaffleEntity
    ): Promise<CollectibleRaffleResponse> {
        try {
            const createdBy = await this.em.findOne(UserDto, {
                externalUserId: linkCollectibleToRaffleEntity.createdBy
            });

            if (!createdBy) {
                throw new BadRequestException(
                    `Invalid user: ${linkCollectibleToRaffleEntity.createdBy}`
                );
            }

            const collectible = await this.em.findOne(CollectibleDto, {
                id: linkCollectibleToRaffleEntity.collectibleId,
                createdBy: createdBy.id
            });

            if (!collectible) {
                throw new NotFoundException('Collectible not found');
            }

            const linkedRaffles: CollectibleRaffleDto[] = await this.em.find(
                CollectibleRaffleDto,
                {
                    collectibleId: linkCollectibleToRaffleEntity.collectibleId,
                    createdBy: createdBy.id
                },
                {
                    fields: ['raffleId', 'raffleId.name', 'score']
                }
            );

            const availableRaffles: RaffleDto[] = await this.em.find(
                RaffleDto,
                {
                    event: collectible.event,
                    createdBy: createdBy.id
                },
                {
                    fields: ['id', 'name', 'useWeight']
                }
            );

            return {
                linked: linkedRaffles.map(linked => {
                    return {
                        id: linked.id,
                        score: linked.score,
                        raffle: {
                            id: linked.raffleId.id,
                            name: linked.raffleId.name,
                            useWeight: linked.raffleId.useWeight
                        }
                    };
                }),
                available: availableRaffles.map(available => {
                    return {
                        id: available.id,
                        name: available.name,
                        useWeight: available.useWeight
                    };
                })
            };
        } catch (error) {
            this.logger.error(`Error retrieving raffles from collectible: ${error}`);

            throw error;
        }
    }

    public async getQuestionnaire(
        collectibleId: string
    ): Promise<CollectibleQuestionnaireResponse> {
        try {
            const collectible = await this.em.findOne(
                CollectibleDto,
                { id: collectibleId },
                {
                    populate: [
                        'poapStatus',
                        'description',
                        'questions',
                        'questions.answers',
                        'event'
                    ]
                }
            );

            if (!collectible) {
                throw new NotFoundException(`Collectible not found: ${collectibleId}`);
            }

            const dueDate = getDateAtMidnight(
                addDays(collectible.event.endDate ?? collectible.event.startDate, 7)
            );

            const today = getDateAtMidnight(Date.now());
            const startDateAtMidnight = getDateAtMidnight(collectible.event.startDate);

            if (today > dueDate) {
                throw new BadRequestException(`POAP expired: ${collectibleId}`);
            }

            if (collectible?.image) {
                collectible.image = collectible.fullImagePath;
            }

            /*
             * Returns an empty state as the event has not started yet
             */
            if (collectible.poapStatus !== 'Approved' || today < startDateAtMidnight) {
                return new CollectibleQuestionnaireResponse({
                    title: '',
                    description: '',
                    logoUrl: '',
                    eventStartDate: collectible.event.startDate,
                    fields: []
                });
            }

            return new CollectibleQuestionnaireResponse({
                title: collectible.name,
                description: collectible.description,
                logoUrl: collectible?.image,
                eventStartDate: collectible.event.startDate,
                fields: collectible.questions.toArray()
            });
        } catch (error) {
            this.logger.error(`Error retrieving questionnaire ${collectibleId}: ${error}`);

            throw error;
        }
    }

    public async postAttendeeQuestionnaireResponse(
        postAttendeeQuestionnaireResponse: PostAttendeeQuestionnaireResponseEntity
    ): Promise<AttendeeQuestionnaireResponse> {
        try {
            const collectible = await this.em.findOne(CollectibleDto, {
                id: postAttendeeQuestionnaireResponse.collectibleId
            });

            if (collectible === null) {
                throw new NotFoundException(
                    `Collectible not found: ${postAttendeeQuestionnaireResponse.collectibleId}`
                );
            }

            const answers = Object.entries(postAttendeeQuestionnaireResponse.answers);

            for (const [question, answer] of answers) {
                const response = this.em.create(QuestionnaireAttendeeResponseDto, {
                    collectible: postAttendeeQuestionnaireResponse.collectibleId,
                    beneficiary: postAttendeeQuestionnaireResponse.beneficiary,
                    question,
                    answer: (answer as unknown as string[]).join(this.answersSeparator)
                });

                this.em.persist(response);
            }

            /**
             * Verifies if the participant already has a ticket assigned.
             */
            let raffleParticipant = await this.em.findOne(RafflesParticipantsDto, {
                beneficiary: postAttendeeQuestionnaireResponse.beneficiary,
                event: collectible.event
            });

            if (raffleParticipant === null) {
                const ticketNumber = await this.getTicketNumber(collectible.event);

                raffleParticipant = this.em.create(RafflesParticipantsDto, {
                    beneficiary: postAttendeeQuestionnaireResponse.beneficiary,
                    event: collectible.event,
                    ticketNumber: ticketNumber
                });

                this.em.persist(raffleParticipant);
            }

            await this.em.flush();

            try {
                await this.claimPoapOnBehalfOfAttendee(postAttendeeQuestionnaireResponse);
            } catch (error) {
                this.logger.error(
                    `Error claiming POAP on behalf of attendee: ${error}`,
                    CollectiblesService.name
                );
            }

            return {
                beneficiary: raffleParticipant.beneficiary,
                ticketNumber: raffleParticipant.ticketNumber,
                eventId: raffleParticipant.event.id
            };
        } catch (error) {
            this.logger.error(`Error adding attendee response: ${error}`, CollectiblesService.name);

            if (error?.name == 'UniqueConstraintViolationException') {
                throw new BadRequestException('Attendee already responded.');
            }

            throw error;
        }
    }

    public async getMintLinks(getMintLinksEntity: GetCollectibleEntity): Promise<MintLinkResponse> {
        try {
            const createdBy = await this.em.findOne(UserDto, {
                externalUserId: getMintLinksEntity.createdBy
            });

            if (!createdBy) {
                throw new BadRequestException(`Invalid user: ${getMintLinksEntity.createdBy}`);
            }

            const collectible = await this.em.findOne(
                CollectibleDto,
                {
                    id: getMintLinksEntity.collectibleId,
                    createdBy: createdBy.id
                },
                {
                    populate: ['externalPoapId', 'secretCode', 'mintLinks']
                }
            );

            if (!collectible) {
                throw new NotFoundException('Collectible not found');
            }

            if (collectible.mintLinks?.length > 0) {
                collectible.poapStatus = 'Approved';
                await this.em.flush();

                return {
                    success: true,
                    error: `No errors. Mint links count: ${collectible.mintLinks?.length}`
                };
            }

            const mintLinksResult = await this.externalPoapService.getMintLinks(
                collectible.externalPoapId,
                collectible.secretCode
            );

            mintLinksResult.externalMintLinResponse?.forEach(link => {
                const mintLink = this.em.create(MintLinkDto, {
                    claimed: link.claimed,
                    qrHash: link.qr_hash,
                    collectible,
                    createdBy: createdBy.id
                });

                this.em.persist(mintLink);
            });

            if (mintLinksResult.success && mintLinksResult.externalMintLinResponse.length > 0) {
                collectible.poapStatus = 'Approved';
            }

            await this.em.flush();

            this.logger.log(
                `Mint links count: ${mintLinksResult.externalMintLinResponse?.length}
                for collectible: ${collectible.id} with POAP Id: ${collectible.externalPoapId}`
            );

            return {
                success: mintLinksResult.success,
                error: `No errors. Mint links count: ${mintLinksResult.externalMintLinResponse?.length}`
            };
        } catch (error) {
            this.logger.error(
                `Error retrieving mint links for collectible ${getMintLinksEntity.collectibleId}: ${error}`,
                CollectiblesService.name
            );

            throw error;
        }
    }

    public async submitPoap(
        collectible: UpdateCollectibleEntity,
        event: EventDto,
        imagePath: string
    ): Promise<ExternalPoapResponse> {
        const { POAP_REQUESTER_EMAIL, POAP_TEMPLATE_ID } = process.env;
        const startDate: string = fromMillisecondsToPoapDate(event.startDate);
        const endDateTimestamp = event.multiDay === true ? event.endDate : event.startDate;
        const endDate: string = fromMillisecondsToPoapDate(endDateTimestamp);
        const expiryDate: string = fromMillisecondsToPoapDate(addDays(endDateTimestamp, 7));
        const secretCode: number = random(100000, 999999);

        const request: ExternalPoapRequest = {
            city: event.city,
            country: event.country,
            description: collectible.description,
            email: POAP_REQUESTER_EMAIL,
            endDate: endDate,
            eventTemplateId: parseInt(POAP_TEMPLATE_ID),
            eventUrl: collectible.website,
            expiryDate: expiryDate,
            image: imagePath,
            name: collectible.name,
            privateEvent: false,
            requestedCodes: collectible.attendees,
            secretCode: secretCode,
            startDate: startDate,
            virtualEvent: event.virtual
        };

        try {
            const submitResult = await this.externalPoapService.submit(request);

            return submitResult;
        } catch (error) {
            const errorMessage = error.message;

            return {
                success: false,
                error: errorMessage || error,
                poapId: null
            };
        }
    }

    private imageURLResolver(
        companyId: string,
        eventId: string,
        collectibleId: string,
        mimetype: string
    ) {
        return `organizations/${companyId}/events/${eventId}/collectibles/${collectibleId}/image_${Date.now()}.${
            mimetype?.split('/')[1] || 'png'
        }`;
    }

    /**
     * @returns The image URL without the base URL
     */
    private async uploadImage(
        collectibleEntity: CollectibleEntity | UpdateCollectibleEntity,
        userId: string,
        collectible: CollectibleDto,
        awsBucket: string
    ): Promise<string> {
        if (
            collectibleEntity?.image &&
            typeof collectibleEntity?.image !== 'string' &&
            this.allowedMimeTypes.includes(collectibleEntity?.image?.mimetype)
        ) {
            const imagePath = this.imageURLResolver(
                userId,
                collectible.event.id,
                collectible.id,
                collectibleEntity.image.mimetype
            );

            const { key } = await this.s3Service.uploadFile(
                collectibleEntity.image.buffer,
                imagePath,
                awsBucket
            );

            return key;
        }

        return null;
    }

    private async getUser(externalUserId: string): Promise<UserDto> {
        const userDto = await this.em.findOne(UserDto, {
            externalUserId: externalUserId
        });

        if (!userDto) {
            throw new BadRequestException(`Invalid user: ${externalUserId}`);
        }

        return userDto;
    }

    private async claimPoapOnBehalfOfAttendee(
        postAttendeeQuestionnaireResponse: PostAttendeeQuestionnaireResponseEntity
    ): Promise<void> {
        /**
         * 1st: verify the beneficiary has not claimed this POAP already
         */

        const mintLinkByBeneficiary = await this.em.findOne(
            MintLinkDto,
            {
                collectible: postAttendeeQuestionnaireResponse.collectibleId,
                beneficiary: postAttendeeQuestionnaireResponse.beneficiary
            },
            {
                fields: ['*']
            }
        );

        if (mintLinkByBeneficiary !== null) {
            throw new BadRequestException(
                'Beneficiary already claimed a code for this Collectible'
            );
        }

        /**
         * 2nd: get a qrHash that has not been claimed yet
         */

        const mintLinks = await this.em.find(
            MintLinkDto,
            {
                collectible: postAttendeeQuestionnaireResponse.collectibleId,
                claimed: false
            },
            {
                fields: ['*']
            }
        );

        if (!mintLinks) {
            this.logger.warn(
                `No more mint links available for collectible ${postAttendeeQuestionnaireResponse.collectibleId}. Please request more.`,
                CollectiblesService.name
            );

            throw new NotFoundException(
                `Collectible not found: ${postAttendeeQuestionnaireResponse.collectibleId}`
            );
        }

        if (mintLinks.length == 0) {
            throw new InternalServerErrorException(
                'No more mint links available. Please contact the Memento support.'
            );
        }

        let i = 0;
        let success = false;

        /**
         * 3rd: try to claim on behalf of the attendee.
         * This while is required because the POAP for this qrHash
         * could have been claimed outside Memento
         */
        do {
            const mintLink = mintLinks[i];

            const result = await this.externalPoapService.claimPoapOnBehalfOfAttendee(
                mintLink.qrHash,
                postAttendeeQuestionnaireResponse.beneficiary
            );

            if (result.success) {
                mintLink.claimed = true;
                mintLink.beneficiary = postAttendeeQuestionnaireResponse.beneficiary;

                await this.em.flush();
            } else {
                if (result.error !== 'Mint link taken') {
                    throw new InternalServerErrorException(
                        `Error minting POAP on behalf of attendee: ${result.error}`
                    );
                }

                this.logger.log(
                    `POAP '${mintLink.qrHash}' claimed outside Memento by ${result.beneficiary}`,
                    CollectiblesService.name
                );

                mintLink.claimed = true;
                mintLink.beneficiary = result.beneficiary;

                await this.em.flush();
            }

            success = result.success;
        } while (success === false && ++i < mintLinks.length);

        /**
         * In this scenario all mint links have been claimed
         * and someone tried to claim one. In other words,
         * we would need to request more mint links.
         */

        if (success !== true) {
            this.logger.warn(
                `No more mint links available for collectible ${postAttendeeQuestionnaireResponse.collectibleId}. Please request more.`,
                CollectiblesService.name
            );

            throw new InternalServerErrorException(
                'No more mint links available. Please contact the Memento support.'
            );
        }
    }

    private async getTicketNumber(event: EventDto): Promise<number> {
        const maxTicketNumber = await this.em.findOne(
            RafflesParticipantsDto,
            { event },
            { orderBy: { ticketNumber: QueryOrder.DESC } }
        );

        if (!maxTicketNumber) {
            return 1;
        }

        // Now let's return the next available number in the raffle queue.
        return maxTicketNumber.ticketNumber + 1;
    }
}
