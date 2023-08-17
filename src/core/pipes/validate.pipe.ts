import {
    ArgumentMetadata,
    BadRequestException,
    HttpStatus,
    Injectable,
    ValidationPipe
} from '@nestjs/common';
import { throwCustomError } from 'src/core/utils';

@Injectable()
export class ValidateInputPipe extends ValidationPipe {
    public async transform(value, metadata: ArgumentMetadata) {
        try {
            return await super.transform(value, metadata);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throwCustomError(
                    new Error(this.handleError(error.getResponse()['message']), {
                        cause: HttpStatus.UNPROCESSABLE_ENTITY
                    }),
                    `${ValidateInputPipe.name} - Validate.Pipe`
                );
            }
        }
    }

    private handleError(errors) {
        return errors.map(error => error);
    }
}
