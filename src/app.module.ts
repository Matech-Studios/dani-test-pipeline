import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import dotenv from 'dotenv';
import { AwsSdkModule } from 'nest-aws-sdk';
import { I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { LoggerMiddleware } from 'src/core/middlewares';
import { CustomLogger } from 'src/core/utils';
import { AuthModule, FirebaseService } from 'src/modules/auth';
import { CompaniesModule, CompanyService } from 'src/modules/companies';
import { EventsModule } from 'src/modules/events';
import { S3ManagerModule } from 'src/modules/s3';
import { UsersModule } from 'src/modules/users';
import { CollectiblesModule } from './modules/collectibles/collectibles.module';
import { ExternalPoapModule } from './modules/external-poap/external-poap.module';
import { PublicModule } from './modules/public/public.module';
import { RafflesModule } from './modules/raffles';
import { MailModule } from './modules/mail/mail.module';
import { MailService } from './modules/mail';

dotenv.config();
const { AWS_ACCESS_KEY, AWS_REGION, AWS_SECRET_KEY } = process.env;

@Module({
    imports: [
        MikroOrmModule.forRoot(),
        ConfigModule.forRoot({ isGlobal: true }),
        UsersModule,
        AuthModule,
        CompaniesModule,
        EventsModule,
        CollectiblesModule,
        RafflesModule,
        ExternalPoapModule,
        S3ManagerModule,
        AwsSdkModule.forRoot({
            defaultServiceOptions: {
                region: AWS_REGION,
                credentials: {
                    accessKeyId: AWS_ACCESS_KEY,
                    secretAccessKey: AWS_SECRET_KEY
                }
            },
            services: [S3]
        }),
        PublicModule,
        MailModule,
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: path.join(__dirname, '/i18n/'),
                watch: true
            },
            resolvers: [{ use: QueryResolver, options: ['lang'] }]
        })
    ],
    providers: [
        FirebaseService,
        CompanyService,
        CustomLogger,
        {
            provide: 'ExternalAuthService',
            useValue: FirebaseService
        },
        MailService
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('');
    }
}
