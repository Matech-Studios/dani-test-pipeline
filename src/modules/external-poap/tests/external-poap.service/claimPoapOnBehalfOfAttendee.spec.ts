import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { PoapSettingsDto } from 'src/core/dto/poapSettings.dto';
import { poapSettingsDtoMock } from 'src/core/testsMocks/externalPoap/poapSettingsDto.mock';
import { CustomLogger, isEmail } from 'src/core/utils';
import { S3ManagerService } from '../../../s3';
import { ExternalPoapService } from '../../external-poap.service';

let service: ExternalPoapService;
const s3ServiceMock = {
    getFile: jest.fn().mockReturnValue({ Body: '' })
};

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const poapToken = 'api-token';
process.env = {
    AWS_BUCKET: 'bucket-name',
    POAP_API_TOKEN: poapToken,
    POAP_AUDIENCE: 'memento',
    POAP_CLIENT_ID: 'client_1',
    POAP_CLIENT_SECRET: 'secret_1'
};

const claimInfoResponse = {
    status: 200,
    data: {
        claimed: false,
        secret: ''
    },
    headers: {},
    config: {}
};

const mintClaimResponse = {
    status: 200,
    data: {
        success: true,
        secret: ''
    },
    headers: {},
    config: {}
};

const getExternalService = async (
    poapSettingsDtoMock: PoapSettingsDto
): Promise<ExternalPoapService> => {
    const entityManagerMock = {
        findOne: jest.fn().mockResolvedValue(poapSettingsDtoMock),
        flush: jest.fn()
    };

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

describe('should generate new token', () => {
    beforeEach(async () => {
        jest.clearAllMocks();

        // The below token expired on 17/01/2018 at 10:30:22 PM AR time
        service = await getExternalService({
            ...poapSettingsDtoMock,
            value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ'
        });
    });

    it('with expired token', async () => {
        const accessToken = 'access.token';
        const beneficiary = 'beneficiary_123';
        const qrHash = 'abc123';

        mockedAxios.get.mockResolvedValue(claimInfoResponse);
        const axiosPost = mockedAxios.post.mockResolvedValue({
            ...mintClaimResponse,
            data: {
                ...mintClaimResponse.data,
                access_token: accessToken
            }
        });

        const result = await service.claimPoapOnBehalfOfAttendee(qrHash, beneficiary);

        const axiosPostCalls = axiosPost.mock.calls;
        const getTokenCall = axiosPostCalls[0];
        const claimQrCall = axiosPostCalls[1];

        expect(getTokenCall[1]).toEqual({
            audience: process.env['POAP_AUDIENCE'],
            client_id: process.env['POAP_CLIENT_ID'],
            client_secret: process.env['POAP_CLIENT_SECRET'],
            grant_type: 'client_credentials'
        });

        expect(claimQrCall[1]).toEqual({
            address: beneficiary,
            qr_hash: qrHash,
            secret: '',
            sendEmail: isEmail(beneficiary)
        });

        expect(result).toEqual({ success: true });
    });
});

describe('should return an error', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        service = await getExternalService(poapSettingsDtoMock);
    });

    it('if qrHash is not provided', async () => {
        const result = await service.claimPoapOnBehalfOfAttendee('', 'beneficiary');
        expect(result).toEqual({ success: false, error: 'Invalid qrHash' });
    });

    it('if POAP is already claimed', async () => {
        const qrHash = 'validQrHash';
        const beneficiary = 'beneficiary@example.com';

        mockedAxios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                claimed: true,
                beneficiary: 'beneficiary@example.com'
            }
        });

        const result = await service.claimPoapOnBehalfOfAttendee(qrHash, beneficiary);
        expect(result).toEqual({
            success: false,
            error: 'Mint link taken',
            beneficiary
        });
    });
});

describe('should set sendEmail', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        service = await getExternalService(poapSettingsDtoMock);
    });

    it('to true if beneficiary is an email', async () => {
        const qrHash = 'validQrHash';
        const beneficiary = 'beneficiary@example.com';

        mockedAxios.get.mockResolvedValue(claimInfoResponse);
        mockedAxios.post.mockResolvedValue(mintClaimResponse);

        const result = await service.claimPoapOnBehalfOfAttendee(qrHash, beneficiary);

        expect(result).toEqual({
            success: true
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/actions/claim-qr',
            {
                address: beneficiary,
                qr_hash: qrHash,
                secret: claimInfoResponse.data.secret,
                sendEmail: true
            },
            expect.any(Object)
        );
    });

    it('to false if beneficiary is not an email', async () => {
        const qrHash = 'validQrHash';
        const beneficiary = 'nonemailbeneficiary';

        mockedAxios.get.mockResolvedValueOnce(claimInfoResponse);

        mockedAxios.post.mockResolvedValueOnce(mintClaimResponse);

        const result = await service.claimPoapOnBehalfOfAttendee(qrHash, beneficiary);

        expect(result).toEqual({
            success: true
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/actions/claim-qr',
            {
                address: beneficiary,
                qr_hash: qrHash,
                secret: claimInfoResponse.data.secret,
                sendEmail: false
            },
            expect.any(Object)
        );
    });
});
