import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QuestionnaireAnswerRequest {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    // This contradiction occurs since numbers in forms are still strings
    @IsString()
    answerKey: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    answerText: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    type?: string;
}
