import { EntityManager } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { externalPoapEntityMock } from 'src/core/testsMocks';
import { poapSettingsDtoMock } from 'src/core/testsMocks/externalPoap/poapSettingsDto.mock';
import { CustomLogger } from 'src/core/utils';
import { S3ManagerService } from '../../../s3';
import { ExternalPoapService } from '../../external-poap.service';

let service: ExternalPoapService;
const s3ServiceMock = {
    getFile: jest.fn().mockReturnValue({ Body: '' })
};

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const entityManagerMock = {
    findOne: jest.fn().mockResolvedValue(poapSettingsDtoMock),
    flush: jest.fn()
};
const poapId = 123456;
const poapBaseUrl = 'https://api.poap.tech';
const poapToken = 'api-token';
process.env = {
    AWS_BUCKET: 'bucket-name',
    POAP_API_TOKEN: poapToken
};

const getExternalService = async (): Promise<ExternalPoapService> => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            ExternalPoapService,
            CustomLogger,
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

    return module.get<ExternalPoapService>(ExternalPoapService);
};

describe('should return POAP id', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        service = await getExternalService();
    });

    it('if submitted correctly', async () => {
        jest.spyOn(axios, 'post').mockResolvedValueOnce({
            status: 200,
            data: {
                id: poapId
            }
        });

        const response = await service.submit(externalPoapEntityMock);

        expect(response.success).toBeTruthy();
        expect(response.poapId).toBe(poapId);

        expect(s3ServiceMock.getFile).toHaveBeenCalled();
        expect(mockedAxios.post).toHaveBeenCalledWith('/events', expect.anything(), {
            baseURL: poapBaseUrl,
            headers: {
                'x-api-key': poapToken,
                accept: 'application/json',
                'content-type': 'multipart/form-data'
            }
        });
    });
});

describe('should return error', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        service = await getExternalService();
    });

    it('on bad request', async () => {
        const poapErrorMessage = 'Error from POAP API';

        jest.spyOn(axios, 'post').mockImplementation(() => {
            throw new BadRequestException({
                data: {
                    message: poapErrorMessage
                }
            });
        });

        const response = await service.submit(externalPoapEntityMock);

        expect(response.success).toBeFalsy();
        expect(response.poapId).toBeUndefined();
        expect(response.error).toBe(poapErrorMessage);

        expect(s3ServiceMock.getFile).toHaveBeenCalled();
        expect(mockedAxios.post).toHaveBeenCalledWith('/events', expect.anything(), {
            baseURL: poapBaseUrl,
            headers: {
                'x-api-key': poapToken,
                accept: 'application/json',
                'content-type': 'multipart/form-data'
            }
        });
    });
});
