import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { v4 as uuidv4 } from 'uuid';
import { QuestionnaireAnswerDto } from './questionnaireAnswer.dto';
import { UserDto } from './user.dto';

@Entity({ tableName: 'questionnaires' })
export class QuestionnaireQuestionDto {
    @PrimaryKey({ hidden: true })
    id: string = uuidv4();

    @Property()
    key: number;

    @Property()
    type: string;

    @Property()
    questionText: string;

    @Property()
    isOptional: boolean;

    @ManyToOne({
        joinColumn: 'collectibleId',
        onDelete: 'cascade',
        hidden: true
    })
    collectible: CollectibleDto;

    @OneToMany(() => QuestionnaireAnswerDto, answer => answer.question)
    answers? = new Collection<QuestionnaireAnswerDto>(this);

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
