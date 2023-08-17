import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class PostAttendeeQuestionnaireResponseItemRequest {
    [key: string]: string;
}

export class PostAttendeeQuestionnaireResponseRequest {
    @ApiProperty({
        oneOf: [
            { type: 'string', format: 'email' },
            { type: 'string', format: 'string' }
        ]
    })
    @IsNotEmpty()
    @IsString()
    beneficiary: string;

    @ApiProperty({ type: PostAttendeeQuestionnaireResponseItemRequest })
    @IsNotEmpty()
    @IsObject()
    answers: PostAttendeeQuestionnaireResponseItemRequest;
}
