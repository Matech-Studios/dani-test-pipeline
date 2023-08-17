import { EntityManager } from '@mikro-orm/core';
import { EntityManager as PostgresEntityManager } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { CollectibleDto } from 'src/core/dto/collectible.dto';
import {
    collectibleDtoMock,
    collectibleEntityMock,
    eventDtoMock,
    userDtoMock
} from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { ExternalPoapService } from '../../external-poap';
import { QuestionnairesService } from '../../questionnaires';
import { S3ManagerService } from '../../s3';
import { CollectiblesService } from '../collectibles.service';

describe('Collectibles Service', () => {
    let service: CollectiblesService;

    const now = 1674139117275;
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const awsBucket = 'bucket-123';
    process.env = {
        AWS_BUCKET: awsBucket,
        AWS_BASE_URL: 'http://base.url'
    };
    const externalPoapId = 123456;
    const companyId = userDtoMock.company.id;
    const eventId = eventDtoMock.id;
    const collectibleId = collectibleDtoMock.id;
    const mimetype = collectibleEntityMock.image.mimetype;
    const imageName = 'mykey.png';
    const imagePath = `organizations/${companyId}/events/${eventId}/collectibles/${collectibleId}/image_${Date.now()}.${
        mimetype?.split('/')[1] || 'png'
    }`;

    const s3ServiceMock = {
        uploadFile: jest.fn().mockResolvedValue({ key: imageName })
    };

    const questionnairesServiceMock = {
        deleteByCollectibleId: jest.fn()
    };

    const externalPoapServiceMock = {
        submit: jest.fn().mockResolvedValue({
            success: true,
            poapId: externalPoapId
        })
    };

    describe('submit POAP', () => {
        const entityManagerMock = {
            findOne: jest.fn().mockReturnValueOnce(userDtoMock).mockReturnValueOnce(eventDtoMock),
            create: jest.fn().mockReturnValue(collectibleDtoMock),
            persistAndFlush: jest.fn(),
            flush: jest.fn()
        };

        beforeEach(async () => {
            jest.clearAllMocks();

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CollectiblesService,
                    {
                        provide: PostgresEntityManager,
                        useValue: jest.fn()
                    },
                    {
                        provide: ExternalPoapService,
                        useValue: externalPoapServiceMock
                    },
                    {
                        provide: QuestionnairesService,
                        useValue: questionnairesServiceMock
                    },
                    {
                        provide: EntityManager,
                        useValue: entityManagerMock
                    },
                    {
                        provide: S3ManagerService,
                        useValue: s3ServiceMock
                    }
                ]
            }).compile();

            service = module.get<CollectiblesService>(CollectiblesService);
        });

        it('is successful with valid data', async () => {
            const result = await service.create({
                ...collectibleEntityMock,
                submitExternal: true
            });

            expect(entityManagerMock.findOne).toHaveBeenCalledTimes(2);

            expect(entityManagerMock.create).toHaveBeenCalledWith(CollectibleDto, {
                ...collectibleEntityMock,
                attendees: collectibleEntityMock.attendees,
                event: eventDtoMock,
                createdBy: userDtoMock.id,
                image: null,
                submitExternal: true
            });

            expect(s3ServiceMock.uploadFile).toHaveBeenCalledWith(
                collectibleEntityMock.image.buffer,
                imagePath,
                awsBucket
            );

            expect(entityManagerMock.persistAndFlush).toHaveBeenCalledWith(collectibleDtoMock);

            expect(entityManagerMock.persistAndFlush).toHaveBeenLastCalledWith({
                ...collectibleDtoMock,
                externalPoapId: externalPoapId
            });

            expect(result).toEqual({
                id: collectibleDtoMock.id,
                name: collectibleDtoMock.name,
                attendees: collectibleDtoMock.attendees,
                description: collectibleDtoMock.description,
                event: collectibleDtoMock.event,
                image: `${process.env.AWS_BASE_URL}${collectibleDtoMock.image}`,
                externalPoapId: externalPoapId,
                externalPoapError: null,
                questions: [],
                website: collectibleDtoMock.website
            });

            expect(questionnairesServiceMock.deleteByCollectibleId).not.toHaveBeenCalledWith();
        });
    });
});
