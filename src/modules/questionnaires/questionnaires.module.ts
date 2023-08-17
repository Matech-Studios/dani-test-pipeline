import { Module } from '@nestjs/common';
import { CustomLogger } from 'src/core/utils';

@Module({
    providers: [CustomLogger]
})
export class QuestionnairesModule {}
