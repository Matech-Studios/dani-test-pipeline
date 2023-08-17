import { EntityManager } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
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

const poapApiKey = 'secret_api_key';
// This token will expire on 12/31/2100
const poapToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjQxMzM5MDUzMzR9.JIl1BJZeIpwpJSMGPEf_8LHKoe7_ll3OA9Zklgv53fg';
process.env = {
    POAP_API_TOKEN: poapApiKey
};

const qrCodesSuccessfulResponse = {
    status: 200,
    data: [
        {
            qr_hash: 'hash 1',
            claimed: false
        },
        {
            qr_hash: 'hash2',
            claimed: false
        }
    ],
    headers: {},
    config: {}
};

const entityManagerMock = {
    findOne: jest.fn().mockResolvedValue({
        ...poapSettingsDtoMock,
        value: poapToken
    })
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

beforeEach(async () => {
    jest.clearAllMocks();
    service = await getExternalService();
});

describe('should return mint links', () => {
    it('if POAP is approved', async () => {
        const poapId = 123456789;
        const secretCode = 987654321;

        mockedAxios.post.mockResolvedValue(qrCodesSuccessfulResponse);

        const result = await service.getMintLinks(poapId, secretCode);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `/event/${poapId}/qr-codes`,
            { secret_code: secretCode },
            {
                baseURL: 'https://api.poap.tech',
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${poapToken}`,
                    'content-type': 'application/json',
                    'x-api-key': poapApiKey
                }
            }
        );

        expect(result).toEqual({
            success: true,
            externalMintLinResponse: qrCodesSuccessfulResponse.data
        });
    });
});

describe('should return an error', () => {
    it('if poapId is not provided', async () => {
        await expect(service.getMintLinks(null, 123456)).rejects.toThrowError(BadRequestException);
    });

    it('if secretCode is not provided', async () => {
        await expect(service.getMintLinks(123456, null)).rejects.toThrowError(BadRequestException);
    });
});
