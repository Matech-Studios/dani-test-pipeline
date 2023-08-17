import { MetadataError, NotFoundError, ValidationError } from '@mikro-orm/core';
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Inject
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { CustomError, CustomLogger } from 'src/core/utils';

@Catch()
export class CustomErrorFilter implements ExceptionFilter {
    constructor(
        @Inject(CustomLogger)
        private readonly logger: CustomLogger
    ) {}

    catch(exception: any, host: ArgumentsHost) {
        // Initialize the translation service
        const i18n = I18nContext.current(host);
        const responseException = this.createHttpException(exception, i18n);

        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const status = responseException.getStatus();
        const message = responseException.message || responseException.getResponse();

        if (exception instanceof CustomError) {
            this.logger.error(
                exception.message,
                `Origin: ${exception.affectedMethods[0]}, Stack: ${exception.affectedMethods}`
            );
        } else {
            this.logger.error(exception.message);
        }

        response.status(status).json({
            statusCode: status,
            message
        });
    }

    private createHttpException(exception: any, i18n: I18nContext): HttpException {
        if (exception instanceof HttpException) {
            return exception;
        }

        //MicroOrm Errors
        if (exception instanceof NotFoundError) {
            return new HttpException(exception.message, HttpStatus.NOT_FOUND);
        }

        //Firebase errors
        if (exception.type === 'FirebaseError') {
            let status: HttpStatus;
            let message: string;

            switch (exception.code) {
                case 'auth/user-not-found':
                    status = HttpStatus.BAD_REQUEST;
                    message = i18n.t('FirebaseErrors.userNotFound');
                    break;
                case 'auth/wrong-password':
                case 'auth/invalid-email':
                    status = HttpStatus.BAD_REQUEST;
                    message = i18n.t('FirebaseErrors.wrongCredentials');
                    break;
                case 'auth/email-already-in-use':
                    status = HttpStatus.BAD_REQUEST;
                    message = i18n.t('FirebaseErrors.emailAlreadyInUse');
                    break;
                case 'auth/id-token-expired':
                    status = HttpStatus.UNAUTHORIZED;
                    message = i18n.t('FirebaseErrors.idTokenExpired');
                    break;
                case 'auth/id-token-revoked':
                    status = HttpStatus.UNAUTHORIZED;
                    message = i18n.t('FirebaseErrors.idTokenRevoked');
                    break;
                default:
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                    message = i18n.t('FirebaseErrors.default');
                    break;
            }

            return new HttpException(message, status);
        }

        if (exception.code == '42P01' || exception.code == '23502')
            if (exception.message) {
                exception.message = i18n.t('OrmErrors.databaseError');
                return new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            }

        if (exception instanceof ForbiddenException) {
            return new HttpException(exception.message, HttpStatus.FORBIDDEN);
        }

        if (exception instanceof MetadataError) {
            return new HttpException(exception.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (exception instanceof ValidationError) {
            return new HttpException(exception.message, HttpStatus.BAD_REQUEST);
        }

        if (exception?.message.includes('connect ECONNREFUSED')) {
            exception.message = i18n.t('GenericErrors.tryAgain');
        }

        return new HttpException(
            exception.message,
            exception.cause || exception.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
