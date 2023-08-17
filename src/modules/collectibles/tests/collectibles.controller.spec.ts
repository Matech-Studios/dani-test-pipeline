import { EntityManager } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { CreateCollectibleRequest } from 'src/core/contracts';
import { CustomLogger } from 'src/core/utils';
import { S3ManagerService } from 'src/modules/s3';
import { QuestionnairesService } from '../../questionnaires';
import { CollectiblesController } from '../collectibles.controller';
import { CollectiblesService } from '../collectibles.service';

describe('CollectiblesController', () => {
    let collectiblesController: CollectiblesController;
    const collectibleId = 1;

    const entityManagerMock = {
        findOne: jest.fn(),
        create: jest.fn(),
        persistAndFlush: jest.fn()
    };

    const collectiblesServiceMock = {
        create: jest.fn().mockResolvedValue({ id: collectibleId }),
        unlinkRaffle: jest.fn().mockResolvedValue({ message: 'Raffle unlinked' }),
        getById: jest.fn(),
        updateById: jest.fn(),
        linkToRaffle: jest.fn(),
        getRaffles: jest.fn(),
        getMintLinks: jest.fn()
    };

    const s3ServiceMock = {
        uploadFile: jest.fn().mockResolvedValue({ key: 'mykey.png' })
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CollectiblesController],
            providers: [
                CustomLogger,
                QuestionnairesService,
                {
                    provide: EntityManager,
                    useValue: entityManagerMock
                },
                {
                    provide: CollectiblesService,
                    useValue: collectiblesServiceMock
                },
                { provide: S3ManagerService, useValue: s3ServiceMock }
            ]
        }).compile();

        collectiblesController = module.get<CollectiblesController>(CollectiblesController);
    });

    describe('create', () => {
        it('should call collectiblesService.create with the correct parameters', async () => {
            const request = { user: { uid: 'user123' } } as unknown as Request;
            const response = {} as Response;
            response.status = jest.fn().mockReturnValue(response);
            response.send = jest.fn().mockReturnValue(response);

            const createCollectibleRequest: CreateCollectibleRequest = {
                name: 'My Collectible',
                attendees: 50,
                description: 'My collectible description',
                eventId: 'event-id',
                image: null,
                submitExternal: false
            };

            await collectiblesController.create(request, createCollectibleRequest, response);

            expect(collectiblesServiceMock.create).toHaveBeenCalledWith({
                ...createCollectibleRequest,
                image: null,
                createdBy: 'user123'
            });
        });
    });

    describe('delete raffle', () => {
        it('should call collectiblesService.unlinkRaffle with the correct parameters', async () => {
            const request = { user: { uid: 'user123' } } as unknown as Request;
            const params = {
                collectibleId: 'collectibleId',
                raffleId: 'raffleId'
            };

            const unlinkResponse = await collectiblesController.unlinkRaffle(params, request);

            expect(unlinkResponse.message).toBe('Raffle unlinked');
            expect(collectiblesServiceMock.unlinkRaffle).toHaveBeenCalledWith({
                ...params,
                createdBy: 'user123'
            });
        });
    });
    describe('getById', () => {
        it('should call collectiblesService.getById with the correct parameters', async () => {
            const request = {
                user: { uid: 'user123' }
            } as unknown as Request;
            const params = { collectibleId: 'collectibleId' };

            collectiblesServiceMock.getById = jest
                .fn()
                .mockResolvedValue({ id: params.collectibleId });

            const result = await collectiblesController.getById(request, params);

            expect(collectiblesServiceMock.getById).toHaveBeenCalledWith({
                ...params,
                createdBy: request.user['uid']
            });
            expect(result).toEqual({ id: params.collectibleId });
        });
    });
    describe('updateById', () => {
        it('should call collectiblesService.updateById with the correct parameters', async () => {
            const request = { user: { uid: 'user123' } } as unknown as Request;
            const params = { collectibleId: 'collectibleId' };
            const updateCollectibleRequest = {
                name: 'Updated Collectible',
                attendees: 100,
                description: 'Updated description',
                eventId: 'event-id-updated',
                image: null,
                submitExternal: true
            };

            collectiblesServiceMock.updateById = jest.fn().mockResolvedValue({
                id: params.collectibleId,
                ...updateCollectibleRequest
            });

            const result = await collectiblesController.updateById(
                params,
                request,
                null,
                updateCollectibleRequest
            );

            expect(collectiblesServiceMock.updateById).toHaveBeenCalledWith({
                ...updateCollectibleRequest,
                id: params.collectibleId,
                updatedBy: request.user['uid'],
                image: null
            });
            expect(result).toEqual({
                id: params.collectibleId,
                ...updateCollectibleRequest
            });
        });
    });
    describe('linkToRaffle', () => {
        it('should call collectiblesService.linkToRaffle with the correct parameters', async () => {
            const request = {
                user: { uid: 'user123' }
            } as unknown as Request;
            const params = {
                collectibleId: 'collectibleId',
                raffleId: 'raffleId'
            };
            const linkCollectibleToRaffleRequest = {
                score: 5
            };

            collectiblesServiceMock.linkToRaffle = jest
                .fn()
                .mockResolvedValue({ message: 'Raffle linked' });

            const result = await collectiblesController.linkToRaffle(
                params,
                request,
                linkCollectibleToRaffleRequest
            );

            expect(collectiblesServiceMock.linkToRaffle).toHaveBeenCalledWith({
                ...params,
                score: linkCollectibleToRaffleRequest.score,
                createdBy: request.user['uid']
            });
            expect(result).toEqual({ message: 'Raffle linked' });
        });
    });
    describe('getRaffles', () => {
        it('should call collectiblesService.getRaffles with the correct parameters', async () => {
            const request = {
                user: { uid: 'user123' }
            } as unknown as Request;
            const params = { collectibleId: 'collectibleId' };

            const raffles = [{ id: 'raffle1' }, { id: 'raffle2' }];
            collectiblesServiceMock.getRaffles = jest.fn().mockResolvedValue(raffles);

            const result = await collectiblesController.getRaffles(params, request);

            expect(collectiblesServiceMock.getRaffles).toHaveBeenCalledWith({
                collectibleId: params.collectibleId,
                raffleId: null,
                createdBy: request.user['uid']
            });
            expect(result).toEqual(raffles);
        });
    });
    describe('unlinkRaffle', () => {
        it('should call collectiblesService.unlinkRaffle with the correct parameters', async () => {
            const request = {
                user: { uid: 'user123' }
            } as unknown as Request;
            const params = {
                collectibleId: 'collectibleId',
                raffleId: 'raffleId'
            };

            collectiblesServiceMock.unlinkRaffle = jest
                .fn()
                .mockResolvedValue({ message: 'Raffle unlinked' });

            const result = await collectiblesController.unlinkRaffle(params, request);

            expect(collectiblesServiceMock.unlinkRaffle).toHaveBeenCalledWith({
                ...params,
                createdBy: request.user['uid']
            });
            expect(result).toEqual({ message: 'Raffle unlinked' });
        });
    });

    describe('getMintLinks', () => {
        it('should call collectiblesService.getMintLinks with the correct parameters and return the result when successful', async () => {
            const request = {
                user: { uid: 'user123' }
            } as unknown as Request;
            const params = { collectibleId: 'collectibleId' };

            const mintLinks = [{ link: 'link1' }, { link: 'link2' }];
            const mintLinksResult = { success: true, mintLinks };

            collectiblesServiceMock.getMintLinks = jest.fn().mockResolvedValue(mintLinksResult);

            const result = await collectiblesController.getMintLinks(params, request);

            expect(collectiblesServiceMock.getMintLinks).toHaveBeenCalledWith({
                collectibleId: params.collectibleId,
                createdBy: request.user['uid']
            });
            expect(result).toEqual(mintLinksResult);
        });

        it('should throw BadRequestException when collectiblesService.getMintLinks returns an unsuccessful result', async () => {
            const request = {
                user: { uid: 'user123' }
            } as unknown as Request;
            const params = { collectibleId: 'collectibleId' };
            const error = 'Some error occurred';
            const mintLinksResult = { success: false, error };

            collectiblesServiceMock.getMintLinks = jest.fn().mockResolvedValue(mintLinksResult);

            await expect(collectiblesController.getMintLinks(params, request)).rejects.toThrow(
                new BadRequestException(error)
            );

            expect(collectiblesServiceMock.getMintLinks).toHaveBeenCalledWith({
                collectibleId: params.collectibleId,
                createdBy: request.user['uid']
            });
        });
    });
});
