import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    Res,
    UploadedFile,
    UseFilters,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
    AttendeeQuestionnaireResponse,
    CollectibleQuestionnaireResponse,
    CollectibleRaffleResponse,
    MintLinkResponse,
    UpsertCollectibleResponse
} from 'src/core/contracts';
import {
    CreateCollectibleRequest,
    LinkCollectibleToRaffleRequest,
    PostAttendeeQuestionnaireResponseRequest,
    UpdateCollectibleRequest
} from 'src/core/contracts/requests';
import { CustomErrorFilter } from 'src/core/filters';
import { FirebaseAuthGuard } from '../auth/firebase/firebase.guard';
import { CollectiblesService } from './collectibles.service';

@UseFilters(CustomErrorFilter)
@Controller('collectibles')
@ApiTags('collectibles')
export class CollectiblesController {
    constructor(private readonly collectiblesService: CollectiblesService) {}

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiResponse({
        status: 201,
        description: 'Collectible successfully created.'
    })
    @ApiResponse({
        status: 207,
        description: 'Collectible successfully created but unable to submit POAP.'
    })
    @UseGuards(FirebaseAuthGuard)
    public async create(
        @Req() request: Request,
        @Body() createCollectibleRequest: CreateCollectibleRequest,
        @Res() response: Response<UpsertCollectibleResponse>,
        @UploadedFile() image?: any
    ): Promise<any> {
        const result = await this.collectiblesService.create({
            ...createCollectibleRequest,
            createdBy: request.user['uid'],
            image: image?.fieldname ? image : createCollectibleRequest?.image
        });

        if (result.externalPoapError !== null) {
            return response.status(207).send(result);
        }

        return response.status(201).send(result);
    }

    @Get(':collectibleId')
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404 })
    @UseGuards(FirebaseAuthGuard)
    public async getById(@Req() request: Request, @Param() params) {
        return await this.collectiblesService.getById({
            collectibleId: params.collectibleId,
            createdBy: request.user['uid']
        });
    }

    @Put(':collectibleId')
    @UseInterceptors(FileInterceptor('image'))
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404 })
    @UseGuards(FirebaseAuthGuard)
    public async updateById(
        @Param() params,
        @Req() request: Request,
        @UploadedFile() image,
        @Body() updateCollectibleRequest: UpdateCollectibleRequest
    ): Promise<UpsertCollectibleResponse> {
        return await this.collectiblesService.updateById({
            ...updateCollectibleRequest,
            id: params.collectibleId,
            updatedBy: request.user['uid'],
            image: image?.fieldname ? image : updateCollectibleRequest?.image
        });
    }

    @Post(':collectibleId/raffles/:raffleId')
    @UseGuards(FirebaseAuthGuard)
    public linkToRaffle(
        @Param() params,
        @Req() request: Request,
        @Body() linkCollectibleToRaffleRequest: LinkCollectibleToRaffleRequest
    ) {
        return this.collectiblesService.linkToRaffle({
            collectibleId: params.collectibleId,
            raffleId: params.raffleId,
            score: linkCollectibleToRaffleRequest.score,
            createdBy: request.user['uid']
        });
    }

    @ApiOkResponse({ type: CollectibleRaffleResponse, isArray: true })
    @Get(':collectibleId/raffles')
    @UseGuards(FirebaseAuthGuard)
    public async getRaffles(
        @Param() params,
        @Req() request: Request
    ): Promise<CollectibleRaffleResponse> {
        return await this.collectiblesService.getRaffles({
            collectibleId: params.collectibleId,
            raffleId: null,
            createdBy: request.user['uid']
        });
    }

    @Delete(':collectibleId/raffles/:raffleId')
    @UseGuards(FirebaseAuthGuard)
    public unlinkRaffle(@Param() params, @Req() request: Request) {
        return this.collectiblesService.unlinkRaffle({
            collectibleId: params.collectibleId,
            raffleId: params.raffleId,
            createdBy: request.user['uid']
        });
    }

    @ApiOkResponse({ type: CollectibleQuestionnaireResponse })
    @Get(':collectibleId/questionnaire')
    public async getQuestionnaire(@Param() params): Promise<CollectibleQuestionnaireResponse> {
        return await this.collectiblesService.getQuestionnaire(params.collectibleId);
    }

    @Post(':collectibleId/questionnaireAnswers')
    public async postAttendeeQuestionnaireResponse(
        @Param() params,
        @Body()
        postAttendeeQuestionnaireResponseRequest: PostAttendeeQuestionnaireResponseRequest
    ): Promise<AttendeeQuestionnaireResponse> {
        return await this.collectiblesService.postAttendeeQuestionnaireResponse({
            ...postAttendeeQuestionnaireResponseRequest,
            collectibleId: params.collectibleId
        });
    }

    @ApiOkResponse({ type: MintLinkResponse })
    @Get(':collectibleId/mintlinks')
    @ApiResponse({
        status: 200,
        description: `Mint links have been retrieved and are available for use.
                      NOTE: this endpoint will not update any new mint links.`
    })
    @ApiResponse({
        status: 400,
        description: 'Mint links not yet available or there was an error retrieving them.'
    })
    @UseGuards(FirebaseAuthGuard)
    public async getMintLinks(@Param() params, @Req() request: Request): Promise<MintLinkResponse> {
        const mintLinksResult = await this.collectiblesService.getMintLinks({
            collectibleId: params.collectibleId,
            createdBy: request.user['uid']
        });

        if (mintLinksResult.success !== true) {
            throw new BadRequestException(mintLinksResult.error);
        }

        return mintLinksResult;
    }
}
