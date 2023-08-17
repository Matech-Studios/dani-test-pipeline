import { Module } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { CustomLogger } from 'src/core/utils';

@Module({
    controllers: [PublicController],
    providers: [CustomLogger, PublicService, I18nContext]
})
export class PublicModule {}
