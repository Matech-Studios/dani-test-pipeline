import { Test, TestingModule } from '@nestjs/testing';
import { UpsertRafflesRequest } from 'src/core/contracts/requests';
import { CustomLogger } from 'src/core/utils';
import { RafflesController } from '../raffles.controller';
import { RafflesService } from '../raffles.service';

describe('RafflesController', () => {
    let rafflesController: RafflesController;
    let rafflesService: RafflesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RafflesController],
            providers: [
                CustomLogger,
                {
                    provide: RafflesService,
                    useValue: {
                        upsert: jest.fn(),
                        executeRaffle: jest.fn()
                    }
                }
            ]
        }).compile();

        rafflesController = module.get<RafflesController>(RafflesController);
        rafflesService = module.get<RafflesService>(RafflesService);
    });

    describe('upsert', () => {
        it('should call the raffles service with the correct parameters', async () => {
            const upsertRafflesRequest: UpsertRafflesRequest = {
                eventId: 'ext-user-1',
                raffles: [
                    {
                        name: 'raffle-name-1',
                        key: 1,
                        useWeight: true,
                        prizes: []
                    }
                ]
            };
            const request = { user: { uid: 'uid1' } };

            await rafflesController.upsert(request as any, upsertRafflesRequest);

            expect(rafflesService.upsert).toHaveBeenCalledWith({
                ...upsertRafflesRequest,
                externalUserId: request.user.uid
            });
        });
    });

    describe('executeRaffle', () => {
        it('should call the raffles service with the correct parameters', async () => {
            const raffleId = 'raffleId1';
            const request = { user: { uid: 'uid1' } };

            await rafflesController.executeRaffle(request as any, { raffleId });

            expect(rafflesService.executeRaffle).toHaveBeenCalledWith({
                raffleId,
                externalUserId: request.user.uid
            });
        });
    });
});
