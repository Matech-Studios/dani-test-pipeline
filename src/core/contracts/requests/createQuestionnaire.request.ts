import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import { ToBoolean } from 'src/core/contracts/requests/transformers';
import { QuestionnaireAnswerRequest } from './questionnaireAnswer.request';

export class QuestionnaireQuestionRequest {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    // This contradiction occurs since numbers in forms are still strings
    @IsString()
    key: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    questionText: string;

    @ApiProperty({ type: [QuestionnaireAnswerRequest] })
    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => QuestionnaireAnswerRequest)
    answers: QuestionnaireAnswerRequest[] | null;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @ToBoolean()
    isOptional: boolean;
}
