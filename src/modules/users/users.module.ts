import { Module } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { CustomLogger } from 'src/core/utils';
import { UsersService } from 'src/modules/users/users.service';

@Module({
    providers: [CustomLogger, UsersService, I18nContext],
    exports: [UsersService]
})
export class UsersModule {}
