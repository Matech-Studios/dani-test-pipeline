import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { FirebaseInit } from 'src/core/firebase';
import { I18nMiddleware } from 'nestjs-i18n';
import { AppModule } from 'src/app.module';
import { ValidateInputPipe } from 'src/core/pipes/validate.pipe';
import { CustomLogger } from './core/utils/customLogger.util';

async function bootstrap() {
    FirebaseInit();

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true
    });

    app.use(I18nMiddleware);
    app.useLogger(app.get(CustomLogger));
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidateInputPipe({ whitelist: true, forbidNonWhitelisted: true }));

    const config = new DocumentBuilder()
        .setTitle('Memento API')
        .setDescription('RESTfull API for the Memento project')
        .setVersion('1.1')
        .addBearerAuth()
        .build();

    const options: SwaggerDocumentOptions = {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
    };

    app.enableCors();

    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('swagger', app, document);
    await app.listen(process.env.PORT || 3001, '0.0.0.0');

    Logger.log(`Application running at ${await app.getUrl()}`, 'Starting App');
}
bootstrap();
