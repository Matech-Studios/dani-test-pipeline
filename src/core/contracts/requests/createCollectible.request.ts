import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    ValidateNested
} from 'class-validator';
import { CollectibleImage } from 'src/core/contracts/requests/collectibleImage.request';
import { ToBoolean } from 'src/core/contracts/requests/transformers';
import { QuestionnaireQuestionRequest } from './createQuestionnaire.request';

export class CreateCollectibleRequest {
    @ApiProperty({ maximum: 140 })
    @Length(0, 140)
    @IsString()
    name: string;

    @ApiProperty({ maximum: 500 })
    @Length(0, 500)
    @IsString()
    description: string;

    @ApiProperty()
    @IsOptional()
    website?: string;

    @ApiProperty({ type: CollectibleImage, required: false })
    @IsOptional()
    image?: CollectibleImage | null;

    @ApiProperty()
    @IsOptional()
    attendees: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    eventId: string;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @ToBoolean()
    submitExternal: boolean;

    @ApiProperty({ type: [QuestionnaireQuestionRequest] })
    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => QuestionnaireQuestionRequest)
    questions?: QuestionnaireQuestionRequest[];
}
