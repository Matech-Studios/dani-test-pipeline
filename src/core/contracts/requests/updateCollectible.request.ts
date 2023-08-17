import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { CollectibleImage } from 'src/core/contracts/requests/collectibleImage.request';
import { ToBoolean } from 'src/core/contracts/requests/transformers';
import { QuestionnaireQuestionRequest } from './createQuestionnaire.request';

@ApiExtraModels(CollectibleImage, String)
export class UpdateCollectibleRequest {
    @ApiProperty()
    @IsOptional()
    name: string;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsOptional()
    website?: string;

    @ApiProperty({
        oneOf: [{ $ref: getSchemaPath(CollectibleImage) }, { $ref: getSchemaPath(String) }],
        required: false,
        description: 'String: Reference of a previous loaded image.'
    })
    @IsOptional()
    image?: CollectibleImage | string | null;

    @ApiProperty()
    @IsOptional()
    attendees: number;

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
