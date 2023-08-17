import { Module } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { CustomLogger } from 'src/core/utils';
import { RaffleDataAccessService } from 'src/modules/raffles/raffleDataAccess.service';
import { RafflesController } from './raffles.controller';
import { RaffleHelpers } from './raffles.helper.service';
import { RafflesService } from './raffles.service';

@Module({
    controllers: [RafflesController],
    providers: [RafflesService, CustomLogger, RaffleHelpers, I18nContext, RaffleDataAccessService]
})
export class RafflesModule {}
