import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Req,
    UseFilters,
    UseGuards
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
    CreateEventRequest,
    CreateEventResponse,
    EventRafflesResponse,
    EventsResponse
} from 'src/core/contracts';
import { EditEventRequest } from 'src/core/contracts/requests/editEvent.request';
import { EventResponse } from 'src/core/contracts/responses/event.response';
import { CreateEventEntity, EditEventEntity } from 'src/core/entities';
import { CustomErrorFilter } from 'src/core/filters';
import { FirebaseAuthGuard } from 'src/modules/auth/firebase/firebase.guard';
import { EventsService } from 'src/modules/events/events.service';
import { QuestionnairesService } from '../questionnaires';

@UseGuards(FirebaseAuthGuard)
@UseFilters(CustomErrorFilter)
@Controller('events')
@ApiTags('events')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly questionnairesService: QuestionnairesService
    ) {}

    @Post()
    async create(
        @Req() request: Request,
        @Body() createEventRequest: CreateEventRequest
    ): Promise<CreateEventResponse> {
        const eventEntity: CreateEventEntity = {
            ...createEventRequest,
            externalUserId: this.GetRequestUserUid(request)
        };

        const eventId = await this.eventsService.create(eventEntity);

        return {
            id: eventId
        };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Req() request: Request,
        @Body() editEventRequest: EditEventRequest
    ): Promise<EventResponse> {
        const eventEntity: EditEventEntity = {
            ...editEventRequest,
            id,
            externalUserId: this.GetRequestUserUid(request)
        };

        return await this.eventsService.edit(eventEntity);
    }

    @Get()
    async getEvents(@Req() request: Request): Promise<EventsResponse[]> {
        const eventsEntity = await this.eventsService.find(this.GetRequestUserUid(request));

        return eventsEntity.map(
            eventData =>
                new EventsResponse({
                    id: eventData.id,
                    name: eventData.name,
                    city: eventData.city,
                    country: eventData.country,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate,
                    poapsQuantity: eventData.poapsQuantity,
                    location: eventData.location,
                    virtual: eventData.virtual
                })
        );
    }

    @Get(':id')
    async getEvent(@Param('id') id: string, @Req() request: Request): Promise<EventResponse> {
        return await this.eventsService.findById(id, this.GetRequestUserUid(request));
    }

    @Post(':eventId/externalPoaps')
    public async submitExternalPoaps(@Param() params, @Req() request: Request) {
        return await this.eventsService.submitExternalPoaps({
            eventId: params.eventId,
            createdBy: request.user['uid']
        });
    }

    @ApiOkResponse({ type: EventRafflesResponse, isArray: true })
    @Get(':eventId/raffles')
    public async getRaffles(
        @Param() params,
        @Req() request: Request
    ): Promise<EventRafflesResponse[]> {
        return await this.eventsService.getRaffles(params.eventId, request.user['uid']);
    }

    @ApiOkResponse({ type: EventRafflesResponse, isArray: true })
    @Get(':eventId/questionnaireResponses')
    public async getQuestionnaireResponses(@Param() params, @Req() request: Request) {
        return await this.questionnairesService.getEventsQuestionnaireResponses(
            params.eventId,
            request.user['uid']
        );
    }

    private GetRequestUserUid(request: Request): string {
        return request.user['uid'];
    }
}
