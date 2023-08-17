import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class S3ManagerService {
    constructor(@InjectAwsService(S3) private readonly s3: S3) {}

    async getFile(key: string, bucket: string) {
        const response = await this.s3.getObject({ Bucket: bucket, Key: key }).promise();
        return response;
    }

    async uploadFile(file: ArrayBufferLike, key: string, bucket: string) {
        const response = await this.s3
            .upload({
                Bucket: bucket,
                Key: key,
                Body: file
            })
            .promise();
        return { response, key };
    }

    async deleteFile(key: string, bucket: string) {
        try {
            await this.s3.deleteObject({ Bucket: bucket, Key: key }).promise();
            return { message: `Deleted object with key ${key} successfully` };
        } catch (error) {
            console.log(error);
        }
    }
}
