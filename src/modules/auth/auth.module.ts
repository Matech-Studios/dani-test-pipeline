import { Module } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { PassportModule } from '@nestjs/passport';
import { CustomLogger } from 'src/core/utils';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { FirebaseService } from 'src/modules/auth/firebase/firebase.service';
import { FirebaseStrategy } from 'src/modules/auth/strategies';
import { CompanyService } from 'src/modules/companies';
import { UsersModule } from 'src/modules/users';
import { MailService } from '../mail';

@Module({
    controllers: [AuthController],
    imports: [UsersModule, PassportModule],
    providers: [
        CustomLogger,
        FirebaseStrategy,
        AuthService,
        CompanyService,
        {
            provide: 'ExternalAuthService',
            useClass: FirebaseService
        },
        I18nContext,
        MailService
    ],
    exports: [AuthService, FirebaseStrategy]
})
export class AuthModule {}
