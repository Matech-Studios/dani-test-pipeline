import { Test, TestingModule } from '@nestjs/testing';
import { S3 } from 'aws-sdk';
import {
    createAwsServiceMock,
    createAwsServicePromisableSpy,
    getAwsServiceMock
} from 'nest-aws-sdk/dist/testing';
import { S3ManagerService } from 'src/modules/s3';

describe('S3ManagerService', () => {
    let service: S3ManagerService;
    let testingModule: TestingModule;

    beforeEach(async () => {
        testingModule = await Test.createTestingModule({
            providers: [
                S3ManagerService,
                createAwsServiceMock(S3, {
                    useValue: {
                        deleteObject: () => null,
                        getObject: () => null,
                        upload: () => null
                    }
                })
            ]
        }).compile();
        service = testingModule.get(S3ManagerService);
    });

    it('should call the get method and return the file in S3', async () => {
        const getSpy = createAwsServicePromisableSpy(
            getAwsServiceMock(testingModule, S3),
            'getObject',
            'resolve',
            { Body: { type: 'someType' } }
        );

        const result = await service.getFile('myKey', 'myBucket');

        expect(result.Body).toBeDefined();
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith({
            Bucket: 'myBucket',
            Key: 'myKey'
        });
    });

    it('should call the delete method and return an success message', async () => {
        const deleteSpy = createAwsServicePromisableSpy(
            getAwsServiceMock(testingModule, S3),
            'deleteObject',
            'resolve',
            {}
        );

        const result = await service.deleteFile('myKey', 'myBucket');

        expect(result.message).toContain('myKey');
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledWith({
            Bucket: 'myBucket',
            Key: 'myKey'
        });
    });

    it('should call the upload method and return the file in S3 and the key', async () => {
        const uploadSpy = createAwsServicePromisableSpy(
            getAwsServiceMock(testingModule, S3),
            'upload',
            'resolve',
            {
                Key: 'myKey',
                Bucket: 'myBucket'
            }
        );
        const newBuffer = new Buffer([]).buffer;
        const result = await service.uploadFile(newBuffer, 'myKey', 'myBucket');
        expect(result.response.Key).toBe('myKey');
        expect(result.response.Bucket).toBe('myBucket');
        expect(result.key).toBe('myKey');
        expect(uploadSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledWith({
            Bucket: 'myBucket',
            Key: 'myKey',
            Body: newBuffer
        });
    });
});
