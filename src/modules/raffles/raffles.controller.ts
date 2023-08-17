import { Body, Controller, Get, Param, Req, UseFilters, UseGuards } from '@nestjs/common';
import { Put } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpsertRafflesRequest } from 'src/core/contracts/requests';
import { CustomErrorFilter } from 'src/core/filters';
import { FirebaseAuthGuard } from '../auth/firebase/firebase.guard';
import { RafflesService } from './raffles.service';

@UseGuards(FirebaseAuthGuard)
@UseFilters(CustomErrorFilter)
@Controller('raffles')
@ApiTags('raffles')
export class RafflesController {
    constructor(private readonly raffleService: RafflesService) {}

    @Put()
    async upsert(
        @Req() request: Request,
        @Body() upsertRafflesRequest: UpsertRafflesRequest
    ): Promise<void> {
        return await this.raffleService.upsert({
            ...upsertRafflesRequest,
            externalUserId: request.user['uid']
        });
    }

    @Get(':raffleId/winners')
    async executeRaffle(@Req() request: Request, @Param() params) {
        return await this.raffleService.executeRaffle({
            raffleId: params.raffleId,
            externalUserId: request.user['uid']
        });
    }
}
