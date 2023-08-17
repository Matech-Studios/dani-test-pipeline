import { Module } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { CollectiblesService } from './collectibles.service';
import { CollectiblesController } from './collectibles.controller';
import { CustomLogger } from 'src/core/utils';
import { QuestionnairesService } from '../questionnaires';
import { ExternalPoapService } from '../external-poap';
import { S3ManagerService } from '../s3';

@Module({
    controllers: [CollectiblesController],
    providers: [
        CustomLogger,
        CollectiblesService,
        QuestionnairesService,
        ExternalPoapService,
        S3ManagerService,
        I18nContext
    ]
})
export class CollectiblesModule {}
