import { HttpStatus } from '@nestjs/common';

export class CustomError extends Error {
    public origin: string;
    public cause: any;
    public errorCode: number;
    public affectedMethods: string[];

    constructor(
        message: string,
        origin: string,
        cause: any,
        errorCode: number,
        affectedMethods: string[]
    ) {
        super(message);
        this.origin = origin;
        this.cause = cause;
        this.errorCode = errorCode;
        this.affectedMethods = affectedMethods;
        Error.captureStackTrace(this, CustomError);
    }
}

export function throwCustomError(error: any, methodName: string) {
    let cause: number;
    let errorCode: number;

    if (error instanceof CustomError) {
        cause = error.cause;
        errorCode = error.errorCode;
    } else {
        cause = error.cause || HttpStatus.INTERNAL_SERVER_ERROR;
        errorCode = error.code || null;
    }

    const affectedMethods =
        error instanceof CustomError ? [...error.affectedMethods, methodName] : [methodName];

    throw new CustomError(error.message, methodName, cause, errorCode, affectedMethods);
}
