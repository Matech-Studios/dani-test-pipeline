import { Module } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { FirebaseService } from 'src/modules/auth';
import { EventsController } from 'src/modules/events/events.controller';
import { EventsService } from 'src/modules/events/events.service';
import { UsersService } from '../users/users.service';
import { CustomLogger } from 'src/core/utils';
import { CollectiblesService } from '../collectibles/collectibles.service';
import { QuestionnairesService } from '../questionnaires';
import { ExternalPoapService } from '../external-poap';
import { S3ManagerService } from '../s3';
import { MailService } from '../mail';

@Module({
    controllers: [EventsController],
    providers: [
        CustomLogger,
        UsersService,
        QuestionnairesService,
        EventsService,
        ExternalPoapService,
        S3ManagerService,
        CollectiblesService,
        {
            provide: 'ExternalAuthService',
            useClass: FirebaseService
        },
        I18nContext,
        MailService
    ]
})
export class EventsModule {}
