import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { CustomLogger } from 'src/core/utils';

@Module({
    providers: [CustomLogger, MailService]
})
export class MailModule {}
