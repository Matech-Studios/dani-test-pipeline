import { Module } from '@nestjs/common';
import { CustomLogger } from 'src/core/utils';
import { S3ManagerService } from '../s3';
import { ExternalPoapService } from './external-poap.service';

@Module({
    providers: [ExternalPoapService, CustomLogger, S3ManagerService]
})
export class ExternalPoapModule {}
