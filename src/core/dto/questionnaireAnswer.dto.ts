import { v4 as uuidv4 } from 'uuid';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { QuestionnaireQuestionDto } from 'src/core/dto/questionnaireQuestion.dto';
import { UserDto } from './user.dto';

@Entity({ tableName: 'questionnaire_answers' })
export class QuestionnaireAnswerDto {
    @PrimaryKey({ hidden: true })
    id: string = uuidv4();

    @Property()
    answerKey: number;

    @Property()
    answerText: string;

    @Property({ nullable: true })
    type?: string;

    @ManyToOne(() => QuestionnaireQuestionDto, {
        joinColumn: 'questionnaireId',
        onDelete: 'cascade',
        hidden: true
    })
    question: QuestionnaireQuestionDto;

    @ManyToOne(() => UserDto, {
        joinColumn: 'createdBy',
        onDelete: 'set null',
        hidden: true
    })
    createdBy: string;

    @ManyToOne(() => UserDto, {
        joinColumn: 'updatedBy',
        nullable: true,
        onDelete: 'set null',
        hidden: true
    })
    updatedBy?: string;

    @Property({ onCreate: () => Date.now(), type: 'bigint', hidden: true })
    createdAt: number;

    @Property({
        onUpdate: () => Date.now(),
        type: 'bigint',
        nullable: true,
        hidden: true
    })
    updatedAt?: number;
}
