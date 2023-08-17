import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PublicEventResponse } from 'src/core/contracts';
import { CustomErrorFilter } from 'src/core/filters';
import { PublicService } from './public.service';

@UseFilters(CustomErrorFilter)
@Controller('public')
@ApiTags('public')
export class PublicController {
    constructor(private readonly publicService: PublicService) {}

    @ApiOkResponse({ type: PublicEventResponse })
    @Get('events/:id')
    findEventById(@Param('id') id: string) {
        return this.publicService.findEventById(id);
    }

    @ApiOkResponse({ type: PublicEventResponse })
    @Get('events/:eventId/participant/:beneficiary/ticketNumber')
    findParticipantTicketNumber(
        @Param('eventId') eventId: string,
        @Param('beneficiary') beneficiary: string
    ) {
        return this.publicService.findParticipantTicketNumber(eventId, beneficiary);
    }
}
