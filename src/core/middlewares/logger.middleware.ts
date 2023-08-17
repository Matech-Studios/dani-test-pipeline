import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger, GlobalStore } from '../utils/customLogger.util';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private logger: CustomLogger) {}

    use(req: Request, res: Response, next: NextFunction) {
        const requestId: string = (req.headers['x-request-id'] as string) || uuidv4();

        res.setHeader('x-request-id', requestId);

        GlobalStore.enterWith({ requestId });

        const { method, originalUrl } = req;

        this.logger.log(`${method} - ${originalUrl}`, 'HTTP - Request');

        res.on('finish', () => {
            const { statusCode } = res;

            this.logger.log(`${method} - ${statusCode}`, 'HTTP - Response');
        });

        next();
    }
}
